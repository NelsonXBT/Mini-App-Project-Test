import Greeting from "@/components/home/Greeting";
import ContinueLearning from "@/components/home/ContinueLearning";
import FollowNelson from "@/components/home/FollowNelson";
import FadeIn from "@/components/ui/FadeIn";

import { user } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Greeting name={user.name} />

      <ContinueLearning />

      <div className="mt-8">
        <FollowNelson />
      </div>
    </>
  );
}