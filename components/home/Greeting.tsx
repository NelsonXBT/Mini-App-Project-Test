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
    <section>
      <p className="text-sm text-zinc-400">
        {greeting} 👋,
      </p>

      <h1 className="text-2xl font-bold text-white">
        {name}
      </h1>
    </section>
  );
}