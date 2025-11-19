import { CheckCircle2 } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center mb-12 animate-fadeIn">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>

      <h1 className="text-4xl sm:text-5xl mb-2 font-bold drop-shadow">
        My Daily Tasks
      </h1>

      <p className="text-lg text-gray-600">Stay organized and productive</p>
    </div>
  );
}
