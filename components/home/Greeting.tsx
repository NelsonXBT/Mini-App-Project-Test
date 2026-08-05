type GreetingProps = {
  name: string;
};

export default function Greeting({
  name,
}: GreetingProps) {
  const currentHour = new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <section className="space-y-0.5 py-2">
      <p className="text-sm font-medium tracking-tight text-[var(--text-muted)]">
        {greeting} 👋
      </p>

      <h2 className="text-4xl font-semibold leading-none tracking-[-0.03em] text-[var(--text)]">
        {name}
      </h2>
    </section>
  );
}