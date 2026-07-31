type GreetingProps = {
  name: string;
};

export default function Greeting({ name }: GreetingProps) {
  const currentHour = new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <section className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">
          {greeting}👋,
        </p>

        <h1 className="text-3xl font-bold">
          {name} 
        </h1>

        <p className="mt-2 text-gray-400">
          Let's continue your creative journey.
        </p>
      </div>

      <button className="text-2xl">
        🔔
      </button>
    </section>
  );
}