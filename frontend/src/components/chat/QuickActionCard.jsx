export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  template,
  prompt,
  setInput,
}) {
  return (
    <div
      onClick={() => setInput(template ?? prompt ?? "")}
      className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 text-left hover:border-indigo-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
