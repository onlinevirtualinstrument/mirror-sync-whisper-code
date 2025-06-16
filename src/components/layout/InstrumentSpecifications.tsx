
interface InstrumentSpecificationsProps {
  specs: Record<string, string>;
}

const InstrumentSpecifications = ({ specs }: InstrumentSpecificationsProps) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <dl className="space-y-4">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2">
            <dt className="text-gray-600">{key}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default InstrumentSpecifications;
