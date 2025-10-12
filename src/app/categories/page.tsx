import ExpandableCategory from "@/components/ExpandableCategory";
import Footer from "@/components/Footer";

function CategoriesPage() {
  const watermelonItems = ["수박", "노란수박", "애플수박", "복수박"];
  const appleItems = ["빨간사과", "청사과", "홍로사과", "부사사과"];
  const mangoItems = ["태국망고", "필리핀망고", "인도망고", "애플망고"];
  const grapeItems = ["샤인머스캣", "거봉", "캠벨얼리", "레드글로브"];
  const cherryItems = ["빙그레체리", "스위트체리", "라니어체리", "빙체리"];
  const melonItems = ["참외", "멜론", "하미과", "캔탈루프"];
  const riceItems = ["쌀", "현미", "흑미", "찹쌀"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* 헤더 */}
        <div className="mt-[18px] mx-5 pb-[18px] border-b-2 border-[#949494]">
          <h1 className="font-semibold">카테고리</h1>
        </div>
        {/* 카테고리 목록 */}
        <div className="pb-10">
          <ExpandableCategory title="수박" content={watermelonItems} />
          <ExpandableCategory title="사과" content={appleItems} />
          <ExpandableCategory title="망고" content={mangoItems} />
          <ExpandableCategory title="포도" content={grapeItems} />
          <ExpandableCategory title="체리" content={cherryItems} />
          <ExpandableCategory title="참외" content={melonItems} />
          <ExpandableCategory title="쌀" content={riceItems} isLast={true} />
        </div>
      </div>
      {/* 푸터 */}
      <Footer />
    </div>
  );
}

export default CategoriesPage;
