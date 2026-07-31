
import Link from "next/link";



export default function BottomNavigation() {
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800">

            <div className="max-w-md mx-auto flex justify-around py-4">

                <button className="text-cyan-400 font-semibold">
                    <Link href="/">Home</Link>
                </button>

                <button className="text-cyan-400 font-semibold">
                    <Link href="/courses">Courses</Link>
                </button>

                <button className="text-cyan-400 font-semibold">
                    <Link href="/resources">Resources</Link>
                </button>

                <button className="text-cyan-400 font-semibold">
                    <Link href="/community">Community</Link>
                </button>

            </div>

        </nav>
    );
}