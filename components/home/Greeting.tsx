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
    <section className="space-y-1 pt-2 pb-2">
      <p className="text-[15px] font-medium text-[var(--text-muted)]">
        {greeting} 👋,
      </p>

      <h2 className="text-[42px] font-bold leading-none tracking-tight text-[var(--text)]">
        {name}
      </h2>
    </section>
  );
}