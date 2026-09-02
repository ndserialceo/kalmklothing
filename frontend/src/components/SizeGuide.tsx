"use client";

import Modal from "./Modal";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeData = [
  { size: "S", chest: '36-38"', waist: '30-32"', hip: '38-40"', chestCm: "91-97", waistCm: "76-81", hipCm: "97-102" },
  { size: "M", chest: '38-40"', waist: '32-34"', hip: '40-42"', chestCm: "97-102", waistCm: "81-86", hipCm: "102-107" },
  { size: "L", chest: '40-42"', waist: '34-36"', hip: '42-44"', chestCm: "102-107", waistCm: "86-91", hipCm: "107-112" },
  { size: "XL", chest: '42-44"', waist: '36-38"', hip: '44-46"', chestCm: "107-112", waistCm: "91-97", hipCm: "112-117" },
  { size: "XXL", chest: '44-46"', waist: '38-40"', hip: '46-48"', chestCm: "112-117", waistCm: "97-102", hipCm: "117-122" },
];

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Size Guide" className="max-w-2xl">
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-200">
                <th className="py-3 px-4 text-left font-semibold text-brand-900">Size</th>
                <th className="py-3 px-4 text-left font-semibold text-brand-900">Chest</th>
                <th className="py-3 px-4 text-left font-semibold text-brand-900">Waist</th>
                <th className="py-3 px-4 text-left font-semibold text-brand-900">Hip</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map((row) => (
                <tr key={row.size} className="border-b border-brand-100 last:border-0">
                  <td className="py-3 px-4 font-medium text-brand-900">{row.size}</td>
                  <td className="py-3 px-4 text-brand-600">
                    {row.chest}
                    <span className="text-brand-400 ml-1">({row.chestCm} cm)</span>
                  </td>
                  <td className="py-3 px-4 text-brand-600">
                    {row.waist}
                    <span className="text-brand-400 ml-1">({row.waistCm} cm)</span>
                  </td>
                  <td className="py-3 px-4 text-brand-600">
                    {row.hip}
                    <span className="text-brand-400 ml-1">({row.hipCm} cm)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-brand-400 space-y-1">
          <p>Measurements are in inches with centimeters in parentheses.</p>
          <p>If you are between sizes, we recommend sizing up for a more relaxed fit.</p>
        </div>
      </div>
    </Modal>
  );
}
