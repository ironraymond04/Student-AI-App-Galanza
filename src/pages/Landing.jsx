import { Link } from "react-router";
import profile from "../assets/profile.png"

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-gray-800 px-6 py-10">

      <div className="text-center max-w-3xl">
        <img
          src={profile}
          alt="Profile"
          className="w-40 h-40 mx-auto rounded-full shadow-lg border-4 border-white"
        />
        <h1 className="mt-6 text-4xl font-bold text-black-700">
          Raymond Christian Galanza
        </h1>
        <p className="mt-2 text-lg text-gray-600 italic">BS Information Technology</p>
      </div>

      <div className="mt-8 max-w-2xl text-center bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-black-600 mb-4">My IT Journey</h2>
        <p className="text-gray-700 leading-relaxed">
          Since my first year in IT, I have been passionate about technology and its impact 
          on people’s lives. I started by learning the fundamentals of programming, then 
          gradually explored web development, databases, and cybersecurity. Along the way, 
          I built projects that strengthened my problem-solving skills and teamwork. 
          Every year brought new challenges that motivated me to keep growing as a future 
          IT professional.
        </p>
      </div>

      <nav className="mt-10 flex gap-6">
        <Link
          to="/students"
          className="px-5 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
        >
          Students
        </Link>
        <Link
          to="/subjects"
          className="px-5 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
        >
          Subjects
        </Link>
        <Link
          to="/grades"
          className="px-5 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
        >
          Grades
        </Link>
      </nav>
    </div>
  );
}
