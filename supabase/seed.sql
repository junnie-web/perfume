-- 향기록 샘플 데이터 (schema.sql 다음에 실행). 예시 리뷰/뉴스레터는 is_example=true 로 표시돼요.

insert into public.perfumes (id, brand, brand_ko, name, name_ko, conc, family, year, top, heart, base, seasons, mood) values
  ('lelabo-santal33', 'Le Labo', '르라보', 'Santal 33', '상탈 33', 'EDP', '우디', 2011, array['카다멈','바이올렛']::text[], array['아이리스','앰브록산']::text[], array['샌달우드','시더우드','가죽','파피루스']::text[], array['가을','겨울']::text[], array['중성적','크리미','스모키']::text[]),
  ('lelabo-another13', 'Le Labo', '르라보', 'Another 13', '어나더 13', 'EDP', '머스크', 2010, array['페어','암브레트']::text[], array['재스민','모스']::text[], array['앰브록산','머스크']::text[], array['사계절']::text[], array['스킨센트','미니멀']::text[]),
  ('lelabo-rose31', 'Le Labo', '르라보', 'Rose 31', '로즈 31', 'EDP', '우디', 2006, array['로즈','커민']::text[], array['시더우드','베티버']::text[], array['우드','가이악우드','머스크']::text[], array['가을','겨울']::text[], array['중성적','스파이시']::text[]),
  ('diptyque-philosykos', 'Diptyque', '딥티크', 'Philosykos', '필로시코스', 'EDT', '그린', 1996, array['무화과잎','그린노트']::text[], array['무화과','코코넛']::text[], array['무화과나무','시더우드']::text[], array['봄','여름']::text[], array['싱그러운','크리미']::text[]),
  ('diptyque-doson', 'Diptyque', '딥티크', 'Do Son', '도손', 'EDT', '플로럴', 2005, array['오렌지블라썸','핑크페퍼']::text[], array['튜베로즈','로즈']::text[], array['머스크','벤조인']::text[], array['봄','여름']::text[], array['화사한','해변']::text[]),
  ('diptyque-tamdao', 'Diptyque', '딥티크', 'Tam Dao', '탐다오', 'EDT', '우디', 2003, array['사이프러스','머틀']::text[], array['로즈우드','시더우드']::text[], array['샌달우드','앰버','머스크']::text[], array['가을','겨울']::text[], array['차분한','크리미']::text[]),
  ('byredo-gypsywater', 'Byredo', '바이레도', 'Gypsy Water', '집시 워터', 'EDP', '우디', 2008, array['베르가못','레몬','주니퍼']::text[], array['인센스','파인니들','오리스']::text[], array['앰버','바닐라','샌달우드']::text[], array['봄','가을']::text[], array['숲','중성적']::text[]),
  ('byredo-mojaveghost', 'Byredo', '바이레도', 'Mojave Ghost', '모하비 고스트', 'EDP', '플로럴', 2014, array['암브레트','사포딜라']::text[], array['매그놀리아','바이올렛']::text[], array['샌달우드','앰버','시더우드','머스크']::text[], array['사계절']::text[], array['포근한','미니멀']::text[]),
  ('byredo-blanche', 'Byredo', '바이레도', 'Blanche', '블랑쉬', 'EDP', '머스크', 2009, array['알데하이드','핑크페퍼']::text[], array['화이트로즈','피오니','바이올렛']::text[], array['샌달우드','머스크']::text[], array['봄','여름']::text[], array['깨끗한','비누']::text[]),
  ('margiela-lazysunday', 'Maison Margiela', '메종 마르지엘라', 'Lazy Sunday Morning', '레이지 선데이 모닝', 'EDT', '머스크', 2013, array['페어','알데하이드']::text[], array['은방울꽃','아이리스','로즈']::text[], array['화이트머스크','암브레트']::text[], array['봄','여름']::text[], array['깨끗한','포근한']::text[]),
  ('margiela-fireplace', 'Maison Margiela', '메종 마르지엘라', 'By the Fireplace', '바이 더 파이어플레이스', 'EDT', '앰버', 2015, array['핑크페퍼','오렌지블라썸','클로브']::text[], array['밤','가이악우드','주니퍼']::text[], array['바닐라','페루발삼','캐시메란']::text[], array['겨울']::text[], array['스모키','달콤한']::text[]),
  ('margiela-jazzclub', 'Maison Margiela', '메종 마르지엘라', 'Jazz Club', '재즈 클럽', 'EDT', '앰버', 2013, array['핑크페퍼','레몬','네롤리']::text[], array['럼','클라리세이지','베티버']::text[], array['타바코','바닐라','스티락스']::text[], array['가을','겨울']::text[], array['달콤한','스모키']::text[]),
  ('jomalone-woodsage', 'Jo Malone London', '조 말론 런던', 'Wood Sage & Sea Salt', '우드 세이지 앤 씨 솔트', 'Cologne', '아로마틱', 2014, array['암브레트','자몽']::text[], array['씨솔트','세이지']::text[], array['레드알게','드리프트우드']::text[], array['봄','여름']::text[], array['바다','싱그러운']::text[]),
  ('jomalone-pearfreesia', 'Jo Malone London', '조 말론 런던', 'English Pear & Freesia', '잉글리쉬 페어 앤 프리지아', 'Cologne', '플로럴', 2010, array['페어','멜론']::text[], array['프리지아','로즈']::text[], array['파출리','루바브','앰버','머스크']::text[], array['가을']::text[], array['화사한','달콤한']::text[]),
  ('aesop-hwyl', 'Aesop', '이솝', 'Hwyl', '휠', 'EDP', '우디', 2017, array['타임','사이프러스']::text[], array['히노키','프랑킨센스']::text[], array['베티버','오크모스']::text[], array['가을','겨울']::text[], array['숲','스모키','차분한']::text[]),
  ('aesop-tacit', 'Aesop', '이솝', 'Tacit', '테싯', 'EDP', '시트러스', 2015, array['유자','시트러스']::text[], array['바질','클로브']::text[], array['베티버']::text[], array['봄','여름']::text[], array['싱그러운','허브']::text[]),
  ('tomford-tobaccovanille', 'Tom Ford', '톰 포드', 'Tobacco Vanille', '타바코 바닐라', 'EDP', '앰버', 2007, array['타바코잎','스파이스']::text[], array['바닐라','통카빈','카카오']::text[], array['말린과일','우디노트']::text[], array['겨울']::text[], array['달콤한','진한']::text[])
on conflict (id) do nothing;

insert into public.curator_reviews (perfume_id, rating, longevity, sillage, body, is_example, updated_at) values
  ('lelabo-santal33', 4, 4, 4, '첫 스프레이는 카다멈의 건조한 스파이스, 한 시간 뒤부터 가죽 섞인 샌달우드가 피부에 붙어요. 너무 많은 사람이 뿌려서 ''그 향''이 된 게 유일한 단점. 니트 입는 계절에 두 번이면 충분합니다.', true, '2026-09-20'),
  ('diptyque-philosykos', 5, 3, 3, '무화과를 반으로 갈랐을 때의 초록 즙과 나무껍질 냄새가 동시에 나요. 달지 않은 과일 향을 찾는다면 이것부터. 지속력은 EDT답게 반나절 정도라 오후에 한 번 덧뿌립니다.', true, '2026-09-12'),
  ('diptyque-tamdao', 4, 3, 2, '산탈33보다 조용하고 둥근 샌달우드. 확산이 거의 없어서 사무실용으로 제일 안전해요. 가까이 앉은 사람만 ''좋은 나무 냄새''라고 알아채는 정도.', true, '2026-08-30'),
  ('byredo-gypsywater', 4, 3, 3, '레몬 껍질로 시작해서 솔잎과 연기로 넘어가요. 캠핑 다음 날 아침 같은 향. 바닐라가 끝을 부드럽게 잡아줘서 우디 입문용으로 추천합니다.', true, '2026-09-05'),
  ('byredo-blanche', 3, 3, 2, '막 빨아서 햇볕에 말린 흰 셔츠. 호불호 없이 깔끔하지만 그만큼 기억에 남는 한 방은 약해요. 면접이나 첫 만남에 쓰기 좋습니다.', true, '2026-08-18'),
  ('margiela-fireplace', 5, 4, 3, '군밤과 장작 연기, 그 뒤에 따뜻한 바닐라. 겨울 한정으로 제일 많이 손이 가는 병이에요. 여름에 뿌리면 과해서 12월부터 2월까지만.', true, '2026-01-14'),
  ('aesop-hwyl', 5, 4, 3, '비 온 뒤 편백 숲과 절 마당의 향 연기. 달콤함이 전혀 없어서 처음엔 낯선데, 세 번째 뿌린 날부터 매일 찾게 됐어요. 조용한 날의 시그니처.', true, '2026-09-25')
on conflict (perfume_id) do nothing;

insert into public.newsletters (vol, title, body, is_example, published_at) values
  (2, '가을에 우디로 넘어가는 법', '여름 내내 시트러스와 머스크만 쓰다가 갑자기 샌달우드로 가면 향이 무겁게 느껴집니다. 중간 다리가 필요해요.

첫 번째 다리는 그린 우디입니다. 사이프러스, 주니퍼, 솔잎처럼 초록빛이 남아 있는 나무 향은 여름의 산뜻함을 유지하면서 베이스를 한 단계 어둡게 만들어 줍니다. 이번 달 추천은 Byredo Gypsy Water와 Aesop Hwyl.

두 번째 다리는 크리미 우디입니다. 샌달우드가 중심이지만 바이올렛이나 앰버가 모서리를 둥글게 깎아 줘요. Diptyque Tam Dao가 대표적입니다.

마지막으로 스모키 우디. 가죽과 연기가 들어간 향은 11월 이후로 아껴 두세요. Le Labo Santal 33이 여기에 속합니다.', true, to_timestamp(1790467200)),
  (1, 'EDP, EDT, 코롱은 뭐가 다를까', '라벨의 약자는 향료 농도를 뜻합니다. 일반적으로 오 드 퍼퓸(EDP)은 15~20%, 오 드 뚜왈렛(EDT)은 5~15%, 오 드 코롱은 2~5% 안팎이에요. 브랜드마다 기준이 달라서 숫자는 대략적인 범위로 보면 됩니다.

농도가 높다고 무조건 더 좋은 건 아닙니다. 같은 이름이라도 EDT는 톱 노트가 더 밝게, EDP는 베이스가 더 두껍게 느껴지도록 조향을 바꾸는 경우가 많아요.

지속력보다 중요한 건 확산력입니다. 사무실처럼 가까이 앉는 곳에서는 확산이 낮은 향이 예의고, 야외에서는 조금 더 퍼지는 향이 잘 어울립니다. 이번 호부터 리뷰마다 지속력과 확산력을 5단계로 따로 적기로 했어요.', true, to_timestamp(1787788800))
on conflict (vol) do nothing;
-- 샘플 향수는 "신향(NEW)" 표시가 붙지 않도록 등록일을 과거로 둬요.
update public.perfumes set created_at = '2026-01-01' where created_at > now() - interval '1 minute';
