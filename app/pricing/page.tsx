export default function SubscriptionNotice() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-300 to-teal-200 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-teal-900 text-center">
          We’re Putting Things on Pause 💚
        </h1>
        <p className="text-gray-700 text-center leading-relaxed">
          We truly appreciate your interest in supporting us with a Pro subscription. 
          Unfortunately, due to <span className="font-medium">Stripe being unavailable in our country</span>, 
          we’re currently unable to process subscriptions.
        </p>
        <p className="text-gray-700 text-center leading-relaxed">
          We’re actively exploring other solutions to bring Pro plans to you as soon as possible. 
          Thank you for your patience, kindness, and encouragement while we work through this. 🌱
        </p>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-2 text-center">
            Stay in Touch
          </h2>
          <form className="space-y-4 bg-gray-5 p-6 rounded-xl  border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-teal-500 p-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-teal-500 p-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={3}
                placeholder="I’d love to know when Pro is available!"
                className="w-full rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-teal-500 p-2 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="pt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            We’ll keep you updated as soon as new options become available. 💫
          </p>
          <p className="text-sm text-gray-700 font-medium">
            With gratitude and warm regards,<br />
            The SciLens Team ✨
          </p>
        </div>
      </div>
    </div>
  );
}