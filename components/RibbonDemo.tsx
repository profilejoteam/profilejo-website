import Ribbon from './Ribbon';

export default function RibbonDemo() {
  return (
    <div className="max-w-xs mx-auto mt-20">
      <Ribbon text="الأكثر شعبية" color="bg-pink-600">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">خطة مميزة</h2>
          <p className="text-gray-600 mb-4">هذه الخطة هي الأكثر طلباً بين المستخدمين!</p>
          <button className="bg-primary-500 text-white px-6 py-2 rounded-xl font-bold">اشترك الآن</button>
        </div>
      </Ribbon>
    </div>
  );
}
