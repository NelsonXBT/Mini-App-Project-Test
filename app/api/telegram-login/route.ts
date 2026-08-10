import { NextRequest, NextResponse } from "next/server";



import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegram/verify";
import { checkMembership } from "@/lib/telegram/checkMembership";

export const dynamic = "force-dynamic";

/*
 * How long a student session stays valid.
 *
 * Was 30 days. Shortened because this route re-authenticates on every app
 * open — Telegram supplies fresh initData each time, so the session is only
 * bridging the gap between opens, never carrying the login itself. A long
 * window bought nothing and only widened the period in which an old token
 * still worked.
 *
 * Matches ADMIN_SESSION_DAYS so the two halves of the app agree, and sits
 * well beyond any realistic gap between a student's visits — and because the
 * expiry slides forward on each open, an active student is never signed out
 * by it.
 */
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/*
 * Login tracing, development only.
 *
 * This route logged every step at full volume in production, including the
 * decoded Telegram user object — name, username, telegram id, photo URL — on
 * every single app open. That is student PII sitting in the hosting provider's
 * log retention for no operational benefit; the flow is either working or it
 * throws, and the catch block below still reports real failures at all times.
 *
 * Kept rather than deleted because the step-by-step trace is genuinely useful
 * when wiring up a new course channel locally.
 */
const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

export async function POST(req: NextRequest) {
  try {
    debug("========== TELEGRAM LOGIN ==========");

    const { initData } = await req.json();

    if (!initData) {
      debug("❌ Missing initData");

      return NextResponse.json(
        {
          success: false,
          error: "Missing initData.",
        },
        { status: 400 }
      );
    }

    debug("✅ initData received");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN");
    }

    debug("✅ Bot token found");

    const telegramUser = verifyTelegramInitData(
      initData,
      botToken
    );

    debug("✅ Telegram verified");
    debug(telegramUser);

    
    debug("Loading published courses...");

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
    });

    debug("Published courses:", courses.length);

    const unlockedCourses: {
          id: string;
          slug: string;
        }[] = [];

    /*
     * Gated courses this student is NOT in the chat for.
     *
     * The loop below used to just `continue` past a failed membership check,
     * which meant losing access was never written down: the Enrollment row
     * stayed ACTIVE forever, and nothing else in the app ever set INACTIVE.
     * A student who lost access to one course and gained another then had two
     * ACTIVE rows, and the home card happily offered the one they could no
     * longer open.
     */
    const revokedCourseIds: string[] = [];

    /*
     * Courses whose membership we could not determine this time.
     *
     * Tracked separately from revocations because they are the difference
     * between "this student has no courses" and "we could not tell" — the
     * session teardown at the end of this route must not fire on the latter.
     */
    const indeterminateCourseIds: string[] = [];

    /*
     * Published courses with no linked channel.
     *
     * The loop skips these — there is no membership to check — so they never
     * reach unlockedCourses, which is exactly the behaviour the comment on
     * the revocation block below relies on. They are recorded because a
     * course can still be granted manually from the admin panel, and that
     * grant is the one kind of access this route cannot see. Ending a
     * session on their behalf would silently sign out a student the admin
     * had just enrolled by hand.
     *
     * None exist today; this exists so adding one later cannot break logins.
     */
    const ungatedCourseIds: string[] = [];

    for (const course of courses) {
      debug("--------------------------------");
      debug("Course:", course.title);
      debug("Slug:", course.slug);
      debug("Published:", course.isPublished);
      debug("Chat ID:", course.telegramChatId);

      if (!course.telegramChatId) {
        debug("⏭ Skipped (No Telegram Chat ID)");
        ungatedCourseIds.push(course.id);
        continue;
      }

      debug("Calling checkMembership()...");

      const member = await checkMembership(
        course.telegramChatId,
        telegramUser.id
      );

      debug("Membership result:", member);

      /*
       * Three outcomes, and only one of them revokes.
       *
       * "unknown" means Telegram did not give us an answer — an outage, a
       * rate limit, a chat_id that no longer resolves, or the bot losing its
       * admin rights in the channel. Treating that as "they left" would
       * deactivate every enrolment in the platform the moment Telegram
       * hiccuped, so it does nothing at all: the course is not unlocked this
       * time round, and whatever the enrolment said before still stands.
       */
      if (member === "not-member") {
        debug("❌ User not a member");
        revokedCourseIds.push(course.id);
        continue;
      }

      if (member === "unknown") {
        debug("⚠ Membership indeterminate — leaving enrolment untouched");
        indeterminateCourseIds.push(course.id);
        continue;
      }


      unlockedCourses.push({
        id: course.id,
        slug: course.slug,
      });
          }

/*
 * Write the revocations down before deciding anything else.
 *
 * Only for a student we already know about — looking them up rather than
 * upserting keeps the existing behaviour of never creating a User row for
 * someone who has never had access.
 *
 * Scoped to courses we actually checked, so a manual grant from the admin
 * panel for an ungated course is left alone: those are skipped above and
 * never reach revokedCourseIds.
 */
const existingUser = await prisma.user.findUnique({
  where: {
    telegramId: BigInt(telegramUser.id),
  },
  select: { id: true },
});

if (existingUser && revokedCourseIds.length > 0) {
  const { count } = await prisma.enrollment.updateMany({
    where: {
      userId: existingUser.id,
      courseId: { in: revokedCourseIds },
      status: "ACTIVE",
    },
    data: {
      status: "INACTIVE",
      lastCheckedAt: new Date(),
    },
  });

  /*
   * Kept at production volume, unlike the tracing above: this is a state
   * change, not a step marker. If a student reports losing a course, this
   * line is the record of when it happened. No PII — a count and an id.
   */
  if (count > 0) {
    console.info(
      `[telegram-login] deactivated ${count} enrollment(s) for user ${existingUser.id}`
    );
  }
}


if (unlockedCourses.length === 0) {
  debug("❌ No accessible courses");

  /*
   * End the session, so losing every channel actually signs the student out.
   *
   * Without this the old cookie stayed valid: the UI showed the no-access
   * screen, but getCurrentUser() still resolved them server-side, so progress
   * writes and the notifications feed kept working for someone entitled to
   * nothing. The gate was cosmetic; this is what makes it real.
   *
   * Conditions, all required, because this is destructive:
   *
   *  - `existingUser` — only for someone already in the database. A first
   *    visitor with no access has no rows and no session to remove, and this
   *    route deliberately never creates a User for them.
   *
   *  - no indeterminate checks — if Telegram failed to answer for even one
   *    course, "no accessible courses" may be an artefact of that failure
   *    rather than the truth. Signing students out on a Telegram outage would
   *    turn a third-party blip into a platform-wide logout, so an
   *    inconclusive pass leaves the session exactly as it was and the student
   *    keeps whatever the last good check gave them.
   *
   *  - no admin grant on an ungated course — the loop above cannot see that
   *    access, because a course with no linked channel has no membership to
   *    check and is skipped. Such a student is legitimately enrolled and must
   *    stay signed in. Only queried when an ungated course actually exists,
   *    so the common path adds no round trip.
   */
  const adminGrantedElsewhere =
    existingUser && ungatedCourseIds.length > 0
      ? (await prisma.enrollment.count({
          where: {
            userId: existingUser.id,
            courseId: { in: ungatedCourseIds },
            status: "ACTIVE",
          },
        })) > 0
      : false;

  if (
    existingUser &&
    indeterminateCourseIds.length === 0 &&
    !adminGrantedElsewhere
  ) {
    const { count: endedSessions } = await prisma.session.deleteMany({
      where: { userId: existingUser.id },
    });

    const cookieStore = await cookies();
    cookieStore.delete("session");

    if (endedSessions > 0) {
      console.info(
        `[telegram-login] ended ${endedSessions} session(s) for user ${existingUser.id} — no remaining access`
      );
    }
  } else if (indeterminateCourseIds.length > 0) {
    console.warn(
      `[telegram-login] no courses resolved for telegram user, but ${indeterminateCourseIds.length} check(s) were indeterminate — session left intact`
    );
  }

  return NextResponse.json({
    success: true,
    hasAccess: false,
    unlockedCourses: [],
  });
}


debug("Saving user...");

    const user = await prisma.user.upsert({
      where: {
        telegramId: BigInt(telegramUser.id),
      },
      update: {
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        photoUrl: telegramUser.photo_url ?? null,
      },
      create: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        photoUrl: telegramUser.photo_url ?? null,
      },
    });

    debug("✅ User saved");


    debug("Creating enrollments...");

for (const course of unlockedCourses) {
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    update: {
      status: "ACTIVE",
      lastVerifiedAt: new Date(),
    },
    create: {
      userId: user.id,
      courseId: course.id,
      status: "ACTIVE",
      lastVerifiedAt: new Date(),
    },
  });
}

debug("✅ Enrollments created");



    debug("Unlocked Courses:");
    debug(unlockedCourses);

    debug("========== LOGIN COMPLETE ==========");

    const cookieStore = await cookies();

/*
 * Reuse the student's existing session instead of minting another one.
 *
 * This route runs on every app open, and it used to call session.create()
 * unconditionally — so each open left another row behind and nothing ever
 * removed them. One real account had 29 rows, none expired: 29 separately
 * valid credentials, each good for the full window.
 *
 * The token is only replaced when there is no usable one, so the cookie value
 * a student's device already holds keeps working and stays the single live
 * credential for that device. Sliding `expiresAt` forward means an active
 * student's session does not lapse mid-use; what ends it is losing access,
 * handled on the no-access path above.
 */
const presentedToken = cookieStore.get("session")?.value;

let token: string | null = null;

if (presentedToken) {
  const presented = await prisma.session.findUnique({
    where: { token: presentedToken },
    select: { token: true, userId: true, expiresAt: true },
  });

  /*
   * Ownership is checked, not just validity. Two Telegram accounts on one
   * device would otherwise let the second student adopt the first one's
   * session row.
   */
  if (
    presented &&
    presented.userId === user.id &&
    presented.expiresAt > new Date()
  ) {
    token = presented.token;
  }
}

const expiresAt = new Date(
  Date.now() + SESSION_LIFETIME_MS
);

if (token) {
  await prisma.session.update({
    where: { token },
    data: { expiresAt },
  });
} else {
  token = crypto.randomUUID();

  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });
}

/*
 * Sweep this student's dead rows, mirroring what createAdminSession() already
 * does on the admin side. Only rows that are already past `expiresAt` go —
 * getCurrentUser() rejects those anyway, so nothing that could still
 * authenticate is touched, including the row just written above.
 */
const { count: sweptSessions } = await prisma.session.deleteMany({
  where: {
    userId: user.id,
    expiresAt: { lt: new Date() },
  },
});

if (sweptSessions > 0) {
  debug("Swept expired sessions:", sweptSessions);
}

/*
 * Set on every login, including a reuse. The client calls router.refresh()
 * the moment this response lands and the server tree reads this cookie, so
 * skipping the write when the value is unchanged would also skip pushing the
 * new expiry to the browser.
 */
cookieStore.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: expiresAt,
  path: "/",
});


    return NextResponse.json({
    success: true,
    hasAccess: unlockedCourses.length > 0,
    unlockedCourses: unlockedCourses.map(
      (course) => course.slug
      ),
    });

  } catch (error) {
    console.error("========== LOGIN FAILED ==========");
    console.error(error);

    /*
     * Generic message to the client, real one to the server log above.
     *
     * This used to return error.message verbatim, which handed the caller
     * internals like "Missing TELEGRAM_BOT_TOKEN" and Prisma's connection
     * strings. Nothing consumes the text — TelegramAuth branches on `success`
     * and only logs the body — so the shape is unchanged, and the detail is
     * still there in development.
     */
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Authentication failed."
            : error instanceof Error
              ? error.message
              : "Unknown error",
      },
      {
        status: 401,
      }
    );
  }
}