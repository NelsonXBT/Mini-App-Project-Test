

import Greeting from "@/components/home/Greeting";
import ContinueLearning from "@/components/home/ContinueLearning";
import NextLessons from "@/components/home/NextLessons";

import { user } from "@/lib/data";


export default function Home() {
  return (
    <>

            

            <div className="mt-8">
                <Greeting name={user.name} />
            </div>

            <ContinueLearning />

            <div className="mt-8">
            <NextLessons />
            </div>

      

        
    </>
);
  
}