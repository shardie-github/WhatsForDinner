import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Nomad</h1>
      <p className="text-lg text-gray-600 mb-8">
        Meal Planner & Health Tracker
      </p>
      <div className="space-x-4">
        <Link
          href="/app"
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Go to App
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
