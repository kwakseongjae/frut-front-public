const Footer = () => {
  return (
    <footer className="bg-gray-50 px-5 py-6 flex flex-col gap-3">
      <div className="text-sm text-[#262626]">사업자 정보</div>
      <div className="space-y-2 text-xs text-[#595959] ">
        <div>회사명 : 푸룻</div>
        <div>대표자명 : 송민창</div>
        <div>사업자번호 : 429-24-01773</div>
        <div>사업자 주소 : 경기도 김포시 걸포로 32, 105호</div>
        <div>고객센터 번호 : 031-1234-5678</div>
        <div>통신판매업 : 2025-김포걸포-12345</div>
        <div className=" text-[#262626] ">© FRUT ALL RIGHTS RESERVED</div>
      </div>
    </footer>
  );
};

export default Footer;
