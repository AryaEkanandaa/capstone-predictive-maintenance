export default function MessageUser({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl max-w-[70%] shadow">
        {text}
      </div>
    </div>
  );
}
