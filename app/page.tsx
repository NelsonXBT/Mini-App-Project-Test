
import { getContinueLearningCourse } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

import Greeting from "@/components/home/Greeting";
import ContinueLearning from "@/components/home/ContinueLearning";
import FollowNelson from "@/components/home/FollowNelson";

const user = {
  name: "Nelson",
};

export default async function Home() {

  const continueLearning =
  await getContinueLearningCourse();
  
  return (
    <main className="space-y-5">
      <Greeting name={user.name} />

      <ContinueLearning />

      <FollowNelson />
    </main>
  );
}