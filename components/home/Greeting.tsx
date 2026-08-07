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
    <section className="pt-1">
      <p className="text-[13px] font-medium tracking-tight text-[var(--text-muted)]">
        {greeting} 👋
      </p>

      <h2 className="mt-0.5 text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
        {name}
      </h2>
    </section>
  );
}