import Greeting from "@/components/home/Greeting";
import ContinueLearning from "@/components/home/ContinueLearning";
import FollowNelson from "@/components/home/FollowNelson";

import { user } from "@/lib/data";

export default function Home() {
  return (
    <main className="space-y-5">
      <Greeting name={user.name} />

      <ContinueLearning />

      <FollowNelson />
    </main>
  );
}