export const dynamic = "force-dynamic";

import Greeting from "@/components/home/Greeting";
import HomeLearningCard from "@/components/home/HomeLearningCard";
import FollowNelson from "@/components/home/FollowNelson";

const user = {
  name: "Nelson",
};

export default async function Home() {
  return (
    <main className="space-y-5">
      <Greeting name={user.name} />

      <HomeLearningCard />

      <FollowNelson />
    </main>
  );
}