/* Authored sentence annotations. Boundaries and grammatical roles below are
 * explicit editorial data, not guesses from a sentence parser. */
(function (root) {
  'use strict';
  const roles = {
    s: ['subject', '주어'], j: ['subject', '동명사 주어'], g: ['subject', '존재 구문의 형식상 주어'],
    v: ['verb', '동작·서술 동사'], l: ['verb', '주어와 보어를 잇는 동사'],
    o: ['object', '목적어: 동작의 대상'], c: ['complement', '주어의 상태·성질을 나타내는 보어'],
    e: ['complement', '목적어의 상태·동작을 설명하는 보어'],
    m: ['modifier', '방식·정도 등 부가 정보'], t: ['modifier', '시간을 나타내는 말'],
    p: ['modifier', '장소·방향·대상을 나타내는 말'], i: ['modifier', '목적을 나타내는 말'],
    u: ['modifier', '앞의 명사를 꾸미는 말'], z: ['modifier', '형용사의 뜻을 보충하는 to부정사'],
    n: ['connector', '나란한 내용을 잇는 접속사'], k: ['connector', '앞뒤 의미를 연결하는 표현'],
    q: ['clause', '목적어 역할을 하는 내용절'], r: ['clause', '앞의 명사를 꾸미는 관계절'],
    w: ['clause', '시간을 나타내는 부사절'], b: ['clause', '이유를 나타내는 부사절'],
    f: ['clause', '조건을 나타내는 부사절'], a: ['clause', '양보·대조를 나타내는 부사절'],
    h: ['clause', '의문사로 시작하는 간접의문문'], d: ['clause', '직접 인용한 말']
  };
  const notes = {};
  function add(id, rows) {
    notes[id] = rows.map(function (row) {
      const chunks = row[0].split('|').map(function (part) {
        const info = roles[part[0]];
        if (!info) throw new Error('Unknown authored chunk role: ' + part[0]);
        return { text: part.slice(1), role: info[0], label: info[1] };
      });
      return {
        sentence: chunks.map(function (chunk) { return chunk.text; }).join(''),
        chunks: chunks,
        grammar: [{ title: row[1], explanation: row[2] }],
        vocabulary: [{ word: row[3], meaning: row[4], pos: row[5] }]
      };
    });
  }
  add('er1-p0', [
    ['sMina |vlooks |pat the moon |tafter dinner.', 'look at', 'looks at은 미나가 달을 바라본다는 뜻입니다. at the moon은 바라보는 대상을 나타내는 전치사구입니다.', 'looks at', '바라보다', '동사구'],
    ['tOn Monday, |sit |lis |ca thin curve.', 'be동사와 보어', 'it은 달을 가리킵니다. a thin curve는 달이 어떤 모양인지를 설명하는 보어입니다.', 'thin', '가느다란', '형용사'],
    ['tThree nights later, |sthe bright part |lis |cwider.', '비교급 wider', 'wider는 wide의 비교급으로, 밝은 부분이 사흘 전보다 더 넓다는 뜻입니다.', 'wider', '더 넓은', '형용사 비교급'],
    ['sMina |vdraws |oeach shape |pin her notebook.', 'each와 단수 명사', 'each shape는 관찰한 모양을 하나씩 뜻합니다. each 뒤에는 단수 명사 shape가 옵니다.', 'each', '각각의', '한정사'],
    ['sShe |vlearns |qthat the moon seems to change over time.', 'that 내용절과 seem to', 'that 뒤 전체가 배우는 내용입니다. seems to change는 실제 달 자체보다 보이는 모양이 변하는 듯하다는 뜻입니다.', 'over time', '시간이 지나면서', '부사구']
  ]);
  add('er1-p1', [
    ['sThe moon |vdoes not make |oits own light.', '현재형 부정문', '달이 빛을 스스로 만들지 않는다는 뜻입니다. does not 뒤에서는 동사 원형 make를 씁니다.', 'own', '자신의, 스스로의', '형용사'],
    ['sSunlight |vreaches |othe moon |nand |vbounces |poff its surface.', '동작 두 개 연결', '같은 주어 Sunlight에 reaches와 bounces가 연결됩니다. off its surface는 표면에서 튕겨 나오는 방향을 나타내는 전치사구입니다.', 'bounces off', '부딪혀 반사되다', '동사구'],
    ['sSome of that reflected light |vtravels |pto our eyes.', 'some of', 'Some of는 반사된 빛 전체 중 일부를 가리킵니다. to our eyes는 그 빛이 도착하는 곳입니다.', 'reflected', '반사된', '형용사'],
    ['sThe moon |llooks |cbright |aeven when the sky around it is dark.', 'look + 형용사', 'looks 뒤의 bright는 달이 밝아 보인다는 상태를 설명합니다. even when은 주변이 어두울 때조차라는 뜻입니다.', 'bright', '밝은', '형용사'],
    ['kFor this reason, |sthe light |rwe call moonlight |vcomes |pfrom the sun.', '관계대명사 생략', 'we call moonlight는 앞의 the light를 꾸밉니다. 우리가 달빛이라고 부르는 그 빛의 근원은 태양입니다.', 'For this reason', '이러한 이유로', '연결 표현']
  ]);
  add('er1-p2', [
    ['tLong before printed calendars, |speople |vwatched |othe moon |ito measure time.', '목적의 to부정사', 'to measure time은 사람들이 달을 관찰한 목적, 즉 시간을 재기 위해서라는 뜻입니다.', 'measure', '재다, 측정하다', '동사'],
    ['sA full cycle of changing shapes |vtakes |oabout twenty-nine and a half days.', '시간이 걸리는 take', '주어는 모양 변화의 한 주기입니다. takes 뒤의 기간은 그 주기가 완성되는 데 걸리는 시간입니다.', 'cycle', '주기', '명사'],
    ['sPeople |vcould count |othese cycles |ito follow the passing months.', 'could + 동사 원형', 'could count는 옛 사람들이 달의 주기를 셀 수 있었다는 뜻입니다. to follow는 그 목적을 나타냅니다.', 'passing', '지나가는', '형용사'],
    ['sThey |valso watched |oother signs in nature |wwhen they planned seasonal work.', 'when 시간절', 'when 뒤는 자연의 징후를 살펴본 때를 알려 줍니다. planned는 계절에 맞는 일을 계획했다는 뜻입니다.', 'seasonal', '계절에 따른', '형용사'],
    ['sThe moon |lwas not |ca perfect clock, |nbut |sits repeated pattern |lwas |ca useful guide.', 'but의 대조', '달이 완벽한 시계는 아니었다는 말과 반복되는 양상이 유용한 길잡이였다는 말을 but으로 대비합니다.', 'repeated', '반복되는', '형용사']
  ]);
  add('er1-p3', [
    ['sJin and his sister |vwant |oto draw the moon |tafter dinner.', 'want to', 'want 뒤의 to draw는 진과 여동생이 하고 싶은 일입니다. draw는 달을 그리는 행동입니다.', 'draw', '그리다', '동사'],
    ['sThey |vfirst stand |pbeside a bright shop, |nbut |sa tall building |vblocks |otheir view.', 'but으로 상황 대비', '가게 옆에 먼저 서지만 건물이 시야를 가립니다. blocks의 목적어 their view는 두 사람이 바라보는 시야입니다.', 'blocks', '가로막다', '동사'],
    ['sJin |vsuggests |oa nearby park |bbecause it has an open area.', 'because 이유절', '공원을 제안하는 이유는 탁 트인 공간이 있기 때문입니다. it은 앞의 공원을 가리킵니다.', 'nearby', '가까운 곳의', '형용사'],
    ['wBefore they leave, |stheir father |vchecks |qthat the park is open |nand |vgoes |pwith them.', '내용절과 병렬 동사', 'checks 뒤의 that절은 확인하는 내용입니다. goes도 아버지의 동작으로, 공원 개방을 확인하고 함께 갑니다.', 'checks', '확인하다', '동사'],
    ['pAt the park, |sthey |vcan see |othe moon |mclearly |pabove the trees.', 'can + 동사 원형', 'can see는 공원에서 달을 볼 수 있다는 뜻입니다. clearly는 보이는 방식을, above the trees는 달의 위치를 알려 줍니다.', 'clearly', '뚜렷하게', '부사'],
    ['sHis sister |vdraws |oits shape |wwhile Jin writes the date and time.', 'while로 동시 동작', '여동생이 모양을 그리는 동안 진은 날짜와 시간을 적습니다. while은 두 행동이 동시에 진행됨을 나타냅니다.', 'shape', '모양', '명사'],
    ['sThey |vdecide |oto use the same place |ifor their next observation.', 'decide to', 'decide to use는 그 장소를 쓰기로 결정했다는 뜻입니다. 다음 관찰에서도 같은 장소를 쓰려는 계획입니다.', 'observation', '관찰', '명사']
  ]);
  add('er1-p4', [
    ['tTonight, |sBen and his dad |vsit |poutside in the yard.', '함께 묶인 주어', 'Ben and his dad가 하나의 주어 묶음입니다. outside in the yard는 두 사람이 앉아 있는 장소입니다.', 'yard', '마당', '명사'],
    ['sThe moon |lis |cbig and round |pin the sky.', '형용사 보어 두 개', 'big과 round는 모두 달의 모습을 설명하는 보어이며 and로 연결됩니다.', 'round', '둥근', '형용사'],
    ['sBen |vcan see |osome dark spots |pon the moon.', 'some + 복수 명사', 'some dark spots는 달 표면의 어두운 부분 몇 군데를 뜻합니다. can see는 그것을 볼 수 있다는 말입니다.', 'spots', '얼룩, 반점', '명사'],
    ['pIn Korea, |smany people |vsay |qthe spots look like a rabbit.', 'say 뒤 내용절', 'say 뒤에는 that이 생략되어 있습니다. 사람들이 말하는 내용은 반점들이 토끼처럼 보인다는 것입니다.', 'look like', '~처럼 보이다', '동사구'],
    ['sBen |vlooks |magain |nand |vfinds |othe rabbit’s long ears.', '한 주어의 두 동작', 'Ben이 다시 보고 귀를 찾아내는 두 동작을 and로 연결합니다. rabbit’s는 귀가 토끼의 것임을 나타냅니다.', 'ears', '귀', '명사'],
    ['sHe |vsmiles |nand |vdraws |othe rabbit |pin his notebook.', '동사 smiles와 draws', 'He가 미소 짓고 토끼를 그립니다. the rabbit은 draws의 목적어이며 smiles에는 목적어가 없습니다.', 'notebook', '공책', '명사']
  ]);
  add('er1-p5', [
    ['tOn Tuesday afternoon, |sHana |vsees |oa pale moon |pabove her school.', '시간과 장소 정보', '화요일 오후라는 시간에 하나가 달을 봅니다. above her school은 달이 학교 위쪽에 있음을 나타냅니다.', 'pale', '희미한, 옅은', '형용사'],
    ['sShe |lis |csurprised |bbecause she thought the moon came out only at night.', '과거 생각을 전하는 내용절', 'thought 뒤의 the moon came out only at night는 하나가 전에 믿었던 내용입니다. 그 생각 때문에 낮의 달을 보고 놀랍니다.', 'surprised', '놀란', '형용사'],
    ['sHer teacher |vexplains |qthat the moon is often in the sky during the day.', 'that 내용절', '선생님이 설명하는 내용 전체가 that 뒤에 옵니다. often은 낮에도 달이 하늘에 자주 있음을 알려 줍니다.', 'during the day', '낮 동안에', '부사구'],
    ['sWe |voften do not notice |oit |bbecause sunlight makes the whole sky bright.', 'make + 목적어 + 형용사', 'because절의 makes the whole sky bright는 햇빛이 하늘 전체를 밝게 만든다는 구조입니다. 밝은 하늘 때문에 달을 잘 알아차리지 못합니다.', 'notice', '알아차리다', '동사'],
    ['sThe moon |llooks |cpale |tin the daytime, |nbut |sit |vstill reflects |osunlight.', 'look와 일반 동사', 'looks pale의 pale은 달의 겉모습을 설명합니다. 뒤의 reflects는 달이 햇빛을 반사하는 동작을 나타냅니다.', 'reflects', '반사하다', '동사'],
    ['tAfter school, |sHana |vpoints |pto the moon |nand |vshows |oit |pto her little brother.', 'show A to B', 'shows it to her little brother는 남동생에게 달을 보여 준다는 뜻입니다. it은 앞의 the moon을 가리킵니다.', 'points to', '~을 가리키다', '동사구'],
    ['tNow |sthey |vlook |mfor the daytime moon |wwhenever the sky is clear.', 'whenever 시간절', 'whenever는 하늘이 맑을 때마다라는 뜻입니다. look for는 이미 보는 상태가 아니라 찾아보는 행동입니다.', 'look for', '찾다', '동사구']
  ]);
  add('er1-p6', [
    ['tEvery month, |sYuri |vdraws |othe full moon |pon a large sheet of paper.', '반복을 나타내는 현재형', 'Every month와 draws가 매달 반복하는 관찰을 나타냅니다. a sheet of paper는 종이 한 장이라는 표현입니다.', 'full moon', '보름달', '명사구'],
    ['wWhen she puts the drawings side by side, |sthe dark spots |lare |malways |pin the same places.', 'when절과 위치', '그림들을 나란히 놓았을 때 어두운 반점이 같은 위치에 있다는 뜻입니다. side by side는 나란히 놓는 방식입니다.', 'side by side', '나란히', '부사구'],
    ['sHer uncle |vtells |oher |qthat the moon always shows the same side to Earth.', 'tell + 사람 + 내용절', 'tells her 뒤의 that절이 삼촌이 유리에게 알려 주는 내용입니다. 달이 지구에 늘 같은 면을 보인다는 설명입니다.', 'side', '면, 쪽', '명사'],
    ['sThe moon |vspins around |monce |wwhile it travels once around Earth.', 'while로 동시에 일어나는 일', '달이 지구 주위를 한 번 도는 동안 스스로도 한 번 회전한다는 뜻입니다. once가 두 움직임의 횟수를 알려 줍니다.', 'spins around', '회전하다', '동사구'],
    ['kBecause of this, |smost of the other side of the moon |vcannot be seen |pfrom Earth.', '조동사가 있는 수동태', 'cannot be seen은 볼 수 없다는 수동 표현입니다. 지구에서 관측되는 대상인 달의 반대편이 주어입니다.', 'most of', '~의 대부분', '수량 표현'],
    ['sSpacecraft |vtook |ophotos of that hidden side |tmany years ago.', 'take photos의 과거형', 'took photos는 사진을 찍었다는 뜻입니다. hidden은 달의 지구에서 보이지 않는 면을 설명합니다.', 'hidden', '숨겨진, 보이지 않는', '형용사'],
    ['tNow |sYuri |vwants |oto find those photos |pin a science book.', 'want to find', '유리가 원하는 행동은 사진을 찾는 것입니다. those photos는 앞 문장의 우주선이 찍은 사진들입니다.', 'science', '과학', '명사']
  ]);
  add('er1-p7', [
    ['tLast night, |sMinho |vstayed up |mlate |bbecause his family wanted to watch a total lunar eclipse.', 'stay up와 이유절', 'stayed up late는 늦게까지 자지 않았다는 뜻입니다. because 뒤에는 개기월식을 보고 싶었던 이유가 이어집니다.', 'total lunar eclipse', '개기월식', '명사구'],
    ['sA lunar eclipse |vhappens |wwhen Earth is directly between the sun and the moon.', 'when으로 현상 발생 조건', 'when절은 월식이 일어나는 때의 천체 위치를 설명합니다. directly between은 태양과 달 사이의 바로 그 위치입니다.', 'directly', '정확히, 바로', '부사'],
    ['tAt that time, |sEarth’s shadow |vfalls |pon the moon, |nso |sthe moon |lslowly grows |cdarker.', 'grow + 형용사', 'grows darker는 달이 점점 더 어두워진다는 상태 변화입니다. so는 지구 그림자가 드리운 결과를 연결합니다.', 'shadow', '그림자', '명사'],
    ['wWhile Minho was watching, |sthe moon |vdid not disappear |mcompletely.', '과거진행형과 과거 부정', 'was watching은 민호가 지켜보던 중이라는 배경입니다. did not disappear는 달이 완전히 사라지지는 않았다는 뜻입니다.', 'completely', '완전히', '부사'],
    ['kInstead, |sit |lturned |ca dark orange-red color.', 'turn + 보어', 'turned는 여기서 방향을 도는 뜻이 아니라 색이 변했다는 뜻입니다. 뒤의 색 표현이 달의 변한 모습을 알려 줍니다.', 'Instead', '그 대신에', '부사'],
    ['sHis mother |vexplained |qthat some sunlight passes through Earth’s air and still reaches the moon.', '내용절 안의 병렬 동사', '어머니가 설명한 that절에서 some sunlight가 passes와 reaches의 공통 주어입니다. 일부 햇빛이 공기를 통과해 달에 도달합니다.', 'passes through', '~을 통과하다', '동사구'],
    ['sRed light |vgets |pthrough the air |mmore easily than blue light, |nso |sthe moon |llooks |cred.', 'more easily than', '붉은빛이 푸른빛보다 공기를 더 쉽게 통과한다는 비교입니다. looks red의 red는 달이 보이는 색을 설명합니다.', 'more easily', '더 쉽게', '부사 비교급'],
    ['mUnlike a solar eclipse, |sa lunar eclipse |lis |csafe |zto watch with your eyes.', 'safe to watch', '월식은 눈으로 관찰해도 안전하다는 뜻입니다. Unlike는 앞에 나온 일식과의 차이를 보여 줍니다.', 'Unlike', '~와 달리', '전치사'],
    ['wBefore he went to bed, |sMinho |vwrote |othe start and end times |pin his moon journal.', 'before 시간절', '민호가 잠자리에 들기 전에 관찰 시각을 기록했습니다. wrote는 write의 과거형입니다.', 'journal', '관찰 일지', '명사']
  ]);
  add('er2-p0', [
    ['tEvery Saturday, |sJun’s family |vmakes |oa short job list.', '소유격과 현재형', 'Jun’s는 준의 가족이라는 소속을 나타냅니다. Every Saturday와 makes는 매주 반복되는 일을 알려 줍니다.', 'job list', '할 일 목록', '명사구'],
    ['sJun |vwaters |othe plants, |nand |shis sister |vsorts |othe laundry.', '명사가 동사로 쓰인 water', 'waters는 여기서 물이라는 명사가 아니라 식물에 물을 준다는 동사입니다. and 뒤는 여동생의 별도 행동입니다.', 'laundry', '빨랫감', '명사'],
    ['sTheir father |vcooks |olunch |wwhile their mother fixes small things around the house.', 'while과 동시 행동', '아버지가 점심을 만드는 동안 어머니가 집안 물건을 고칩니다. while은 두 일이 동시에 진행됨을 나타냅니다.', 'fixes', '수리하다, 고치다', '동사'],
    ['sThey |vfinish |mfaster |bbecause everyone has a clear task.', 'faster의 부사 용법', 'faster는 일을 끝내는 속도가 더 빠르다는 뜻입니다. 이유는 각자 맡은 일이 명확하기 때문입니다.', 'task', '맡은 일', '명사'],
    ['tAfterward, |sthey |vplay |oa board game |mtogether.', 'afterward의 순서', 'Afterward는 앞에서 말한 집안일을 끝낸 뒤를 가리킵니다. together는 가족이 함께 게임함을 나타냅니다.', 'Afterward', '그 후에', '부사']
  ]);
  add('er2-p1', [
    ['sSora’s grandmother |vlives |pin another city, |nso |sthey |vcannot meet |tevery week.', 'so로 결과 연결', '할머니가 다른 도시에 사는 것이 원인이고 매주 만나지 못하는 것이 결과입니다. cannot 뒤에는 원형 meet가 옵니다.', 'another', '다른', '한정사'],
    ['tOn Sunday evening, |sSora |vrecords |oa voice message about school and her new puppy.', 'about의 명사 수식', 'about school and her new puppy는 메시지에 담긴 내용을 설명합니다. 학교와 새 강아지 이야기를 녹음합니다.', 'records', '녹음하다', '동사'],
    ['sGrandma |vreplies |mwith a story from her own childhood.', 'reply with', 'replies with는 무엇으로 답하는지를 나타냅니다. 할머니는 자신의 어린 시절 이야기로 답합니다.', 'childhood', '어린 시절', '명사'],
    ['aAlthough the messages are short, |sboth of them |vlisten |mmore than once.', 'although 양보절', '메시지가 짧다는 사실에도 불구하고 두 사람은 여러 번 듣습니다. both of them은 소라와 할머니 둘 다입니다.', 'more than once', '한 번 넘게, 여러 번', '부사구'],
    ['sThese messages |vhelp |othem |eshare their lives |aeven when they are far apart.', 'help + 사람 + 동사 원형', 'help them share는 두 사람이 삶을 나누도록 돕는다는 뜻입니다. even when은 멀리 떨어져 있을 때도라는 조건을 더합니다.', 'far apart', '멀리 떨어져', '부사구']
  ]);
  add('er2-p2', [
    ['sDaniel |vlikes |oto tell his family about his day |tat dinner.', 'tell A about B', '가족에게 하루에 관해 말하는 일을 좋아한다는 뜻입니다. tell 뒤의 his family는 이야기를 듣는 사람들입니다.', 'at dinner', '저녁 식사 때', '부사구'],
    ['tOne evening, |she |vnotices |qthat his older brother, Leo, is very quiet.', '동격 이름과 that절', 'Leo는 his older brother와 같은 사람을 가리키는 이름입니다. notices 뒤의 내용은 형이 매우 조용하다는 사실입니다.', 'quiet', '말이 없는, 조용한', '형용사'],
    ['sDaniel |vstops |otalking |nand |vasks, |d“Do you want to tell me something?”', 'stop + 동명사', 'stops talking은 말을 멈춘다는 뜻입니다. 이어서 다니엘이 형에게 하고 싶은 말이 있는지 직접 묻습니다.', 'something', '무언가', '대명사'],
    ['sLeo |lis not |cready |tat first, |nso |sDaniel |vwaits |nand |vlistens.', 'be ready와 결과', 'ready는 레오가 말할 준비가 된 상태를 뜻합니다. 처음에는 준비되지 않아 다니엘이 기다리며 듣습니다.', 'at first', '처음에는', '부사구'],
    ['tLater, |sLeo |vsays |qthat he made a mistake during a team project.', 'make a mistake의 과거', 'made a mistake는 실수했다는 뜻입니다. that절 전체가 레오가 나중에 털어놓은 이야기입니다.', 'mistake', '실수', '명사']
  ]);
  add('er2-p3', [
    ['sSora |vwants |oto make her grandmother’s soup, |nbut |sher grandmother |vlives |pfar away.', 'want to와 but', '소라는 할머니의 수프를 만들고 싶어 합니다. but 뒤는 할머니가 멀리 살아 바로 함께하기 어렵다는 상황입니다.', 'far away', '멀리', '부사구'],
    ['tOn Saturday, |sthey |vtalk |mby video |wwhile Sora’s father helps in the kitchen.', 'by + 수단', 'by video는 영상 통화라는 수단을 나타냅니다. while절은 아버지가 부엌에서 돕는 동시 상황입니다.', 'by video', '영상 통화로', '부사구'],
    ['sHer grandmother |vexplains |oeach step |mslowly |kso |sSora |vcan write |oit |mdown.', '결과·목적을 잇는 so', '할머니는 소라가 적을 수 있도록 단계를 천천히 설명합니다. write it down에서 it은 설명받은 단계를 가리킵니다.', 'step', '단계, 순서', '명사'],
    ['tFirst, |sher father |vcuts |othe vegetables, |nand |sSora |vputs |othem |pin a bowl.', '대명사 them', 'them은 앞의 vegetables를 대신합니다. 아버지가 썬 채소를 소라가 그릇에 넣는 순서입니다.', 'bowl', '그릇', '명사'],
    ['tThen |she |vadds |othem |pto a pot of hot water.', 'add A to B', 'adds them to는 채소를 냄비에 넣는다는 구조입니다. them은 앞 문장의 채소를 계속 가리킵니다.', 'pot', '냄비', '명사'],
    ['wWhen the soup is ready, |sSora |vtastes |oit |nand |vsmiles |pat the screen.', 'when과 동작 연결', '수프가 준비되었을 때 소라가 맛을 보고 화면을 향해 웃습니다. it은 완성된 수프입니다.', 'tastes', '맛보다', '동사'],
    ['sThe family |vcannot share |oone table |ttoday, |nbut |jcooking together |vhelps |othem |efeel close.', '동명사 주어', 'cooking together가 문장의 두 번째 주어로 함께 요리하는 일을 뜻합니다. feel close는 서로 가깝게 느끼는 결과입니다.', 'close', '정서적으로 가까운', '형용사']
  ]);
  add('er2-p4', [
    ['tEvery Friday, |smy family |vmakes |opizza |pat home.', '반복되는 일', 'Every Friday는 매주 금요일을 뜻합니다. 단수로 보는 my family에 맞춰 makes를 씁니다.', 'at home', '집에서', '부사구'],
    ['sMy mom |vrolls out |othe dough |pon the table.', 'roll out', 'rolls out은 반죽을 밀어 펴는 동작입니다. on the table은 반죽을 펴는 장소를 나타냅니다.', 'dough', '반죽', '명사'],
    ['sMy little brother |vputs |ocheese |pon the dough.', 'put + 대상 + 위치', 'puts 뒤의 cheese가 올리는 대상이며 on the dough가 올려놓는 위치입니다.', 'cheese', '치즈', '명사'],
    ['sI |vcut |othe green peppers |mwith my dad’s help.', 'with + 도움', 'with my dad’s help는 아빠의 도움을 받아서라는 뜻입니다. 자르는 대상은 green peppers입니다.', 'green peppers', '피망', '명사구'],
    ['tThen |sDad |vputs |othe pizza |pin the hot oven.', '순서를 알리는 then', 'Then은 피자 재료를 올린 다음 단계임을 나타냅니다. in the hot oven은 피자를 넣는 곳입니다.', 'oven', '오븐', '명사'],
    ['sWe |veat |oit |mtogether |nand |vtalk |mabout our week.', '같은 주어의 병렬 동작', 'We가 피자를 먹고 한 주에 관해 이야기합니다. it은 앞에서 만든 피자를 대신하며 about our week는 대화 주제를 나타내는 전치사구입니다.', 'together', '함께', '부사']
  ]);
  add('er2-p5', [
    ['tEvery evening from eight to nine, |sMia’s family |vturns off |oall their screens.', 'turn off', 'turns off는 기기의 화면을 끈다는 뜻입니다. from eight to nine은 매일 저녁 실천하는 시간 범위입니다.', 'turns off', '끄다', '동사구'],
    ['sNobody |vwatches |oTV |nor |vplays |ogames |pon a phone |tduring that hour.', 'nobody와 단수 동사', 'Nobody는 아무도 하지 않는다는 뜻이며 watches와 plays에 단수형 -s가 붙습니다. or는 하지 않는 두 행동을 연결합니다.', 'Nobody', '아무도 ~않다', '대명사'],
    ['tAt first, |sMia’s older brother |vdoes not like |othe new rule.', 'does not + 원형', '주어가 Mia’s older brother여서 does not을 씁니다. 뒤의 like에는 -s를 붙이지 않습니다.', 'rule', '규칙', '명사'],
    ['sHe |vthinks |qthe hour will feel long and boring.', 'think 뒤 that 생략', 'thinks 뒤 전체가 오빠의 예상입니다. feel long and boring은 그 시간이 길고 지루하게 느껴질 것이라는 뜻입니다.', 'boring', '지루한', '형용사'],
    ['tAfter a few weeks, |khowever, |she |vbegins |oto enjoy it.', 'begin to', 'begins to enjoy는 그 시간을 즐기기 시작한다는 뜻입니다. however가 앞의 부정적인 예상과 달라진 점을 알립니다.', 'however', '하지만', '부사'],
    ['sHe |vteaches |oMia |ocard tricks, |nand |stheir parents |vread |obooks |pnearby.', 'teach + 사람 + 내용', 'teaches Mia card tricks는 미아에게 카드 묘기를 가르친다는 구조입니다. and 뒤에는 부모님의 행동이 이어집니다.', 'tricks', '묘기, 재주', '명사'],
    ['tNow |sthe family |vtalks |nand |vlaughs |mmore than before.', 'more than before', 'more than before는 화면을 끄는 규칙을 시작하기 전보다 더 많이 대화하고 웃는다는 뜻입니다.', 'laughs', '웃다', '동사']
  ]);
  add('er2-p6', [
    ['tOn Sunday mornings, |sTae |vhelps |pin his grandfather’s small garden.', '반복되는 일요일 아침', 'On Sunday mornings는 매주 일요일 아침을 뜻합니다. 정원에서 돕는 일이 반복되므로 현재형 helps를 씁니다.', 'garden', '정원, 텃밭', '명사'],
    ['sThey |vpull |oweeds |mtogether |nand |vwater |othe young bean plants.', 'water의 동사 용법', 'water는 여기서 어린 콩 식물에 물을 준다는 동사입니다. pull weeds는 잡초를 뽑는다는 뜻입니다.', 'weeds', '잡초', '명사'],
    ['sGrandpa’s back |voften hurts, |nso |sTae |vdoes |othe work near the ground.', 'so로 역할 분담 이유 연결', '할아버지의 허리가 자주 아파서 태가 낮은 곳의 일을 맡습니다. hurts는 아프다는 뜻으로 목적어 없이 쓰였습니다.', 'ground', '땅, 지면', '명사'],
    ['kIn return, |sGrandpa |vteaches |ohim |othe names of many plants.', 'teach의 두 목적어', 'him은 배우는 사람인 태이고 the names는 배우는 내용입니다. In return은 도움에 대한 보답을 나타냅니다.', 'In return', '그 보답으로', '연결 표현'],
    ['tLast week, |sTae |vlearned |qthat beans need plenty of sunlight.', 'learned 뒤 내용절', 'that 뒤 전체가 지난주에 태가 배운 내용입니다. plenty of sunlight는 충분하고 많은 햇빛을 뜻합니다.', 'plenty of', '많은, 충분한', '수량 표현'],
    ['wWhen the beans are ready, |sthey |vwill cook |othem |pwith Grandma.', '미래의 when절', '콩이 준비되면 앞으로 요리할 예정입니다. 미래를 말해도 when절에는 현재형 are를 쓰고 주절에 will을 씁니다.', 'ready', '수확할 준비가 된', '형용사'],
    ['sTae |venjoys |othe garden |bbecause he and Grandpa work as a team.', 'because 이유절', '태가 정원 일을 즐기는 이유는 할아버지와 한 팀으로 일하기 때문입니다. as a team은 협력하는 방식을 나타냅니다.', 'as a team', '한 팀으로', '부사구']
  ]);
  add('er2-p7', [
    ['tLast month, |sYerin’s family |lfelt |cbusy |bbecause everyone had a different schedule.', 'feel + 형용사', 'felt busy는 가족이 바쁘다고 느꼈다는 뜻입니다. because절이 서로 다른 일정이라는 이유를 설명합니다.', 'schedule', '일정', '명사'],
    ['sHer parents |vworked |mlate, |nand |sher older brother |vhad |osoccer practice |talmost every evening.', '과거의 병렬 문장', '부모님의 야근과 오빠의 축구 연습을 and로 연결합니다. almost every evening은 거의 매일 저녁입니다.', 'practice', '연습', '명사'],
    ['kSo |sthey |vdecided |oto hold a short family meeting |tevery Sunday night.', 'decide to hold', 'decided to hold는 모임을 열기로 결정했다는 뜻입니다. hold는 여기서 손으로 잡다가 아니라 모임을 개최하다입니다.', 'hold', '모임을 열다', '동사'],
    ['tDuring each meeting, |severyone |vshared |oone good thing and one hard thing from the week.', '서로 짝인 목적어', 'one good thing과 one hard thing은 모두 shared의 목적어입니다. 한 주의 좋은 일과 힘든 일을 하나씩 나눕니다.', 'shared', '이야기를 나누다', '동사'],
    ['tThen |sthey |vchose |oone activity |rthat the whole family could do together.', '관계절 that', 'that 뒤는 어떤 활동을 골랐는지 꾸밉니다. 온 가족이 함께 할 수 있는 활동이라는 조건입니다.', 'chose', '선택했다', '동사'],
    ['wWhen it was Yerin’s turn to choose, |sshe |vpicked |oa bike ride along the river.', '차례를 나타내는 turn', 'Yerin’s turn to choose는 예린이가 선택할 차례라는 뜻입니다. 고른 활동은 강변을 따라 자전거를 타는 일이었습니다.', 'along', '~을 따라서', '전치사'],
    ['wWhile they were riding, |sher brother |vtold |ofunny stories about his team.', '과거진행형 배경', 'were riding은 가족이 자전거를 타던 중이라는 배경입니다. 그동안 오빠가 팀의 재미있는 이야기를 했습니다.', 'funny', '재미있는', '형용사'],
    ['sYerin |vrealized |qthat even a short time together can make a family feel closer.', 'make + 목적어 + 동사 원형', '내용절의 make a family feel closer는 짧은 시간도 가족이 더 가깝다고 느끼게 할 수 있다는 뜻입니다.', 'realized', '깨달았다', '동사']
  ]);
  add('er3-p0', [
    ['sYuna |vplants |othree tomato seeds |tin spring.', 'plant의 동사 용법', 'plants는 여기서 식물이라는 명사가 아니라 심는다는 동사입니다. three tomato seeds가 심는 대상입니다.', 'seeds', '씨앗', '명사'],
    ['sShe |vgives |othem |owater |nand |vputs |othe pot |pby a sunny window.', 'give의 두 목적어', 'gives them water는 씨앗들에게 물을 준다는 구조입니다. by는 화분이 창문 옆에 있음을 나타냅니다.', 'sunny', '햇빛이 잘 드는', '형용사'],
    ['tWeeks later, |ssmall yellow flowers |vappear.', '목적어가 없는 appear', 'appear는 나타나다라는 뜻으로 뒤에 목적어를 쓰지 않습니다. 작은 노란 꽃들이 나타나는 것이 핵심입니다.', 'appear', '나타나다', '동사'],
    ['sThe flowers |lbecome |cred tomatoes |tin summer.', 'become + 명사 보어', 'red tomatoes는 변한 결과를 설명하는 보어입니다. 꽃이 여름에 빨간 토마토가 된다는 뜻입니다.', 'become', '~이 되다', '동사'],
    ['sYuna |vuses |othe tomatoes |pin soup |ifor her family.', 'use A in B', 'uses the tomatoes in soup는 토마토를 수프 재료로 쓴다는 뜻입니다. for her family는 가족을 위한 것임을 알려 줍니다.', 'soup', '수프', '명사']
  ]);
  add('er3-p1', [
    ['sMr. Han |vasks |ohis class |eto examine their lunchboxes by color.', 'ask + 사람 + to부정사', 'asks his class to examine은 학생들에게 살펴보라고 요청하는 구조입니다. by color는 색깔을 기준으로 살펴보라는 뜻입니다.', 'examine', '자세히 살펴보다', '동사'],
    ['sGreen spinach and orange carrots |vprovide |odifferent nutrients.', 'and로 연결한 주어', '녹색 시금치와 주황색 당근 두 식품을 주어로 묶습니다. 서로 다른 영양소를 제공한다는 내용입니다.', 'nutrients', '영양소', '명사'],
    ['sBrown rice |vgives |oenergy, |awhile beans and eggs help build the body.', '대조를 나타내는 while', '여기서 while은 동시 행동보다 역할의 차이를 대비합니다. 현미는 에너지를 주고 콩과 달걀은 몸을 만드는 데 도움이 됩니다.', 'Brown rice', '현미', '명사구'],
    ['sNo single color |vcan provide |oeverything |ra growing child needs.', 'everything 뒤 관계절', 'a growing child needs는 everything을 꾸미며 관계대명사가 생략되어 있습니다. 한 가지 색의 음식만으로 모든 필요를 채울 수 없다는 뜻입니다.', 'single', '단 하나의', '형용사'],
    ['sThe class |vdecides |oto add variety |minstead of searching for one perfect food.', 'instead of + 동명사', 'instead of searching은 완벽한 음식 하나를 찾는 대신이라는 뜻입니다. 결정한 일은 음식에 다양성을 더하는 것입니다.', 'variety', '다양성', '명사']
  ]);
  add('er3-p2', [
    ['sStrawberries |vbegin |otheir trip |pon a farm.', '비유적으로 쓰인 trip', '딸기가 농장에서 출발해 소비자에게 가는 과정을 여행에 빗댔습니다. begin의 목적어는 their trip입니다.', 'trip', '이동 과정, 여행', '명사'],
    ['sWorkers |vput |othe fruit |pinto small boxes.', 'put + 대상 + 방향', '넣는 대상은 the fruit이며 into small boxes는 작은 상자 안으로라는 이동 방향을 나타냅니다.', 'Workers', '작업자들', '명사'],
    ['sSoft paper between the berries |vhelps |estop bumps and bruises.', '명사를 꾸미는 전치사구', 'between the berries는 부드러운 종이가 놓인 위치를 설명합니다. helps stop은 충격과 멍을 막는 데 도움이 된다는 뜻입니다.', 'bruises', '눌려 생긴 멍, 손상', '명사'],
    ['sA truck |vcarries |othe boxes |pto a store.', 'carry A to B', '트럭이 상자들을 가게로 운반합니다. to a store는 운반이 향하는 목적지를 알려 줍니다.', 'carries', '나르다, 운반하다', '동사'],
    ['pAt the store, |sworkers |vplace |othe strawberries |pon a cool shelf.', 'place의 동사 용법', 'place는 여기서 장소라는 명사가 아니라 놓다는 동사입니다. 가게의 시원한 선반에 딸기를 놓습니다.', 'shelf', '선반', '명사'],
    ['sCare at every step |vhelps |othe fruit |ereach shoppers |min good condition.', 'help + 대상 + 동사 원형', 'helps the fruit reach는 딸기가 소비자에게 도달하도록 돕는다는 구조입니다. in good condition은 도착할 때의 좋은 상태입니다.', 'condition', '상태', '명사']
  ]);
  add('er3-p3', [
    ['tEvery Friday, |sLeo |vnotices |ofruit |pin the classroom’s food waste bin.', 'notice의 목적어', 'Leo가 알아차리는 대상은 버려진 과일입니다. 뒤의 in 구는 과일이 있는 교실 음식물 쓰레기통을 나타냅니다.', 'food waste bin', '음식물 쓰레기통', '명사구'],
    ['sHe |vasks |ohis classmates |hwhy they throw it away.', 'why 간접의문문', 'why they throw it away는 왜 버리는지를 묻는 내용입니다. 의문문 어순이 아니라 주어 they 다음 동사 throw를 씁니다.', 'throw it away', '그것을 버리다', '동사구'],
    ['sSome |vsay |qthey bring more food than they can finish during lunch.', 'more ~ than 비교', 'Some은 반 친구들 중 일부입니다. 점심에 다 먹을 수 있는 양보다 많은 음식을 가져온다는 것이 그들이 말한 이유입니다.', 'finish', '다 먹다', '동사'],
    ['sLeo |vsuggests |obringing a smaller amount first and packing extra fruit separately.', 'suggest + 동명사', 'suggests 뒤에 bringing과 packing이라는 두 동명사가 연결됩니다. 처음에는 적게 가져오고 추가 과일은 따로 싸자는 제안입니다.', 'separately', '따로', '부사'],
    ['sHis classmates |vtry |othe plan |tfor one week.', '기간을 나타내는 for', 'try는 계획을 시험해 본다는 뜻입니다. for one week는 계획을 실행하는 기간이 한 주임을 나타냅니다.', 'plan', '계획', '명사'],
    ['tOn Friday, |sthey |vcompare |othe food waste |mwith the amount from the week before.', 'compare A with B', '이번 음식물 쓰레기의 양을 지난주의 양과 비교합니다. from the week before는 비교 기준인 이전 주의 양을 설명합니다.', 'compare', '비교하다', '동사'],
    ['gThere |vis |sless fruit |pin the bin, |nso |sthey |vdecide |oto continue the plan.', 'there is 존재 구문', 'There is는 무엇이 있다는 표현으로 fruit가 실제 존재 대상입니다. less fruit는 이전보다 줄어든 과일 양을 나타냅니다.', 'less', '더 적은', '한정사 비교급'],
    ['sLeo |vlearns |qthat a small change in a daily habit can make a difference.', 'make a difference', 'that절 전체가 레오가 깨달은 내용입니다. make a difference는 매일의 작은 변화가 실제 효과를 낼 수 있다는 뜻입니다.', 'habit', '습관', '명사']
  ]);
  add('er3-p4', [
    ['sCows on a farm |vgive |omilk |tevery morning.', '주어를 꾸미는 on 구', 'on a farm은 어떤 소들인지 설명합니다. 복수 주어 Cows에 맞춰 동사 원형과 같은 현재형 give를 씁니다.', 'Cows', '소들', '명사'],
    ['sThe farmer |vkeeps |othe milk |ecold |pin a big tank.', 'keep + 목적어 + 형용사', 'keeps the milk cold는 우유를 차가운 상태로 유지한다는 뜻입니다. cold는 우유의 상태를 설명하는 목적격 보어입니다.', 'tank', '큰 저장 용기, 탱크', '명사'],
    ['sA truck |vtakes |othe milk |pto a factory.', 'take A to B', 'takes는 여기서 가져가거나 운반한다는 뜻입니다. 트럭이 우유를 공장까지 나릅니다.', 'factory', '공장', '명사'],
    ['sWorkers |vheat |othe milk |ito kill harmful germs |nand |vput |oit |pinto cartons.', '목적의 to부정사', 'to kill harmful germs는 우유를 가열하는 목적입니다. and 뒤의 put도 작업자들이 하는 동작입니다.', 'germs', '세균', '명사'],
    ['tThen |scold trucks |vcarry |othe cartons |pto stores.', '순서를 나타내는 then', '가열하고 포장한 다음 냉장 트럭이 종이팩들을 가게로 운반합니다. cartons는 앞 문장의 우유 포장입니다.', 'cartons', '음료용 종이팩', '명사'],
    ['sJun |vdrinks |oa glass of cold milk |mwith his breakfast.', 'a glass of', 'a glass of cold milk는 차가운 우유 한 잔을 뜻합니다. with his breakfast는 아침 식사와 함께 마신다는 뜻입니다.', 'a glass of', '~ 한 잔', '수량 표현']
  ]);
  add('er3-p5', [
    ['tIn spring, |sfarmers |vfill |otheir rice fields |mwith water.', 'fill A with B', '논을 물로 채운다는 뜻입니다. their rice fields가 채우는 장소이고 with water가 채우는 재료를 나타냅니다.', 'rice fields', '논', '명사구'],
    ['sThey |vplant |oyoung rice plants |min rows |pin the wet fields.', 'plant와 plants 구별', '앞의 plant는 심다는 동사이고 young rice plants의 plants는 어린 벼라는 명사입니다. in rows는 줄을 맞추는 방식입니다.', 'rows', '줄, 열', '명사'],
    ['tDuring the hot summer, |sthe plants |lgrow |ctall and green.', 'grow + 형용사', 'grow 뒤의 tall and green은 자라면서 나타나는 벼의 상태를 설명합니다. 더 키가 크고 푸르게 자랍니다.', 'During', '~ 동안에', '전치사'],
    ['tIn autumn, |sthe rice grains |lturn |cgolden, |nand |sfarmers |vharvest |othem.', 'turn + 형용사', 'turn golden은 알곡이 황금빛으로 변한다는 뜻입니다. them은 수확하는 대상인 rice grains를 대신합니다.', 'harvest', '수확하다', '동사'],
    ['sThe grains |vare dried |nand |vtaken |pto a mill.', '병렬 수동태', '알곡은 말려지고 도정소로 옮겨지는 대상이므로 수동태를 씁니다. taken 앞에는 are가 함께 걸립니다.', 'mill', '도정소', '명사'],
    ['pAt the mill, |smachines |vremove |othe hard outer shell of each grain.', 'remove의 목적어', '기계가 벗겨 내는 대상은 알곡마다 있는 단단한 겉껍질입니다. of each grain이 껍질의 소속을 설명합니다.', 'outer shell', '겉껍질', '명사구'],
    ['pAt home, |swe |vwash |othe rice |nand |vcook |oit |ifor our meals.', '목적어를 대신하는 it', 'it은 앞의 the rice를 가리킵니다. 집에서 쌀을 씻고 식사를 위해 조리하는 두 동작이 연결됩니다.', 'meals', '식사', '명사']
  ]);
  add('er3-p6', [
    ['sMr. Park, a baker, |vstarts |owork |tearly in the morning.', '동격 a baker', 'a baker는 Mr. Park가 어떤 일을 하는 사람인지 덧붙인 설명입니다. starts work는 일을 시작한다는 뜻입니다.', 'baker', '제빵사', '명사'],
    ['sHe |vmixes |oflour, water, a little sugar and yeast |ito make dough.', '목적의 to make', '재료들을 섞는 목적은 반죽을 만드는 것입니다. a little은 설탕의 적은 양을 나타냅니다.', 'yeast', '효모', '명사'],
    ['sYeast |lis |ca tiny living thing, |nand |sit |veats |othe sugar.', '보어와 목적어 구분', 'a tiny living thing은 효모가 무엇인지 설명하는 보어입니다. the sugar는 효모가 먹는 대상인 목적어입니다.', 'tiny', '아주 작은', '형용사'],
    ['wWhen the yeast eats the sugar, |sit |vmakes |ogas bubbles |pin the dough.', 'when 시간절', '효모가 설탕을 먹을 때 기체 방울을 만든다는 설명입니다. it은 효모를 대신하고 in the dough는 방울이 생기는 곳입니다.', 'bubbles', '방울', '명사'],
    ['sThe bubbles |vmake |othe dough |erise, |nso |sit |lbecomes |cbigger and softer.', 'make + 목적어 + 동사 원형', 'make the dough rise는 반죽을 부풀어 오르게 한다는 뜻입니다. bigger and softer는 그 결과 달라진 반죽의 상태입니다.', 'rise', '부풀어 오르다', '동사'],
    ['tThen |sMr. Park |vbakes |othe dough |pin a hot oven.', 'bake의 목적어', '박 씨가 굽는 대상은 앞에서 만든 반죽입니다. in a hot oven은 굽는 장소를 설명합니다.', 'bakes', '굽다', '동사'],
    ['tBy eight o’clock, |sfresh bread |lis |cready |ifor the first customers.', 'by의 시간 한계', 'By eight o’clock은 여덟 시까지는 준비가 된다는 뜻입니다. ready는 빵의 준비된 상태를 나타내는 보어입니다.', 'customers', '손님들', '명사']
  ]);
  add('er3-p7', [
    ['tEvery November, |sHana’s family |vgathers |ito make kimchi for the winter.', '목적의 to make', '가족이 모이는 목적은 겨울에 먹을 김치를 담그는 것입니다. Every November는 매년 반복되는 때입니다.', 'gathers', '모이다', '동사'],
    ['tFirst, |sthey |vcut |othe cabbages |min half |nand |vput |osalt |pbetween the leaves.', 'in half', 'cut the cabbages in half는 배추를 반으로 자른다는 뜻입니다. 이어서 잎 사이에 소금을 넣는 동작이 나옵니다.', 'cabbages', '배추들', '명사'],
    ['sThe salt |vpulls |owater |pout of the leaves, |nso |sthe cabbages |lbecome |csoft.', 'out of와 상태 변화', 'out of the leaves는 물이 잎 밖으로 빠져나오는 방향입니다. become soft는 그 결과 배추가 부드러워진다는 뜻입니다.', 'soft', '부드러운', '형용사'],
    ['tThe next day, |sthey |vwash off |othe extra salt |wwhile Grandma mixes red pepper powder, garlic and other seasonings.', 'wash off와 while', 'wash off는 남은 소금을 씻어 내는 동작입니다. while 뒤에서는 동시에 할머니가 양념 재료를 섞는 모습을 설명합니다.', 'seasonings', '양념 재료', '명사'],
    ['sEveryone |vrubs |othe seasoning |ponto each leaf |nand |vpacks |othe cabbages |pinto containers.', 'onto와 into', 'onto each leaf는 잎 표면에 양념을 바르는 방향입니다. into containers는 배추를 용기 안에 담는 방향입니다.', 'containers', '용기들', '명사'],
    ['tAt first, |sthe kimchi |ltastes |cfresh and salty.', 'taste + 형용사', 'tastes 뒤의 fresh and salty는 김치가 어떤 맛인지를 설명합니다. 처음에는 신선하고 짠 맛이라는 뜻입니다.', 'salty', '짠', '형용사'],
    ['tOver the next few weeks, |sit |lbecomes |csour |bbecause tiny helpful bacteria grow in it.', 'become과 because', 'becomes sour는 김치가 시어지는 상태 변화를 말합니다. because 뒤에는 유익한 세균이 자라는 이유가 이어집니다.', 'sour', '신맛이 나는', '형용사'],
    ['wWhen the kimchi is kept in a cold place, |sthis change |vhappens |mmore slowly.', '수동태 is kept', 'is kept는 김치가 차가운 곳에 보관되는 것을 말합니다. more slowly는 앞의 시어지는 변화가 더 느리게 일어난다는 뜻입니다.', 'more slowly', '더 천천히', '부사 비교급'],
    ['sThat |lis |cwhy the family stores it in a kimchi fridge and enjoys it all winter.', 'that is why', 'That is why는 그래서 그런 행동을 한다는 이유와 결과를 잇는 표현입니다. 김치를 차갑게 보관해 겨울 내내 즐깁니다.', 'stores', '보관하다', '동사']
  ]);
  add('er4-p0', [
    ['sEli |vputs |oa metal spoon and a wooden spoon |pin warm soup.', 'and로 묶은 목적어', '금속 숟가락과 나무 숟가락이 모두 puts의 목적어입니다. 두 숟가락을 같은 따뜻한 수프에 넣습니다.', 'wooden', '나무로 된', '형용사'],
    ['tAfter one minute, |sthe metal handle |lfeels |chotter.', 'feel + 비교급', 'hotter는 뜨거운 정도를 비교하는 보어입니다. 금속 손잡이가 더 뜨겁게 느껴진다는 뜻입니다.', 'handle', '손잡이', '명사'],
    ['sHeat |vmoves |pthrough metal |mmore easily than through wood.', 'more easily than', '열이 나무를 통과할 때보다 금속을 통과할 때 더 쉽게 이동한다는 비교입니다. through는 통과하는 경로를 나타냅니다.', 'Heat', '열', '명사'],
    ['sThe wooden handle |lstays |ccooler, |nso |sEli |vcan hold |oit |mcomfortably.', 'stay + 형용사', 'stays cooler는 나무 손잡이가 비교적 낮은 온도를 유지한다는 뜻입니다. 그래서 엘리가 편하게 잡을 수 있습니다.', 'comfortably', '편안하게', '부사'],
    ['sThe two spoons |vshow |hwhy cooking tools often use wooden handles.', 'why 간접의문문', 'why 뒤 전체가 두 숟가락이 보여 주는 답입니다. 조리 도구가 왜 나무 손잡이를 자주 쓰는지를 설명합니다.', 'tools', '도구들', '명사']
  ]);
  add('er4-p1', [
    ['sNari |vwants |oto compare how much water two paper towels absorb.', 'to부정사 안의 간접의문문', '비교하고 싶은 내용은 두 종이 타월이 흡수하는 물의 양입니다. how much water가 absorb의 대상이며 양을 묻습니다.', 'absorb', '흡수하다', '동사'],
    ['sShe |vcuts |oequal-sized squares |nand |vpours |othe same amount of water |pinto two plates.', '공정한 비교를 위한 same', '같은 크기의 정사각형과 같은 물의 양을 준비합니다. cuts와 pours는 같은 주어 She의 두 동작입니다.', 'equal-sized', '크기가 같은', '형용사'],
    ['tThen |sshe |vleaves |oeach towel |pin the water |tfor ten seconds.', 'leave + 대상 + 위치', 'leaves는 타월을 물속에 둔다는 뜻입니다. for ten seconds는 물에 담가 두는 시간입니다.', 'seconds', '초', '명사'],
    ['sOne towel |vtakes up |omore water, |nbut |sNari |vrepeats |othe test |mthree times |mbefore deciding.', 'take up와 before -ing', 'takes up은 물을 흡수한다는 뜻입니다. before deciding은 결론을 내리기 전이며 나리가 시험을 세 번 반복합니다.', 'repeats', '반복하다', '동사'],
    ['mBy keeping the size, water, and time equal, |sshe |vmakes |othe comparison |efair.', 'by -ing와 make', 'By keeping은 크기·물·시간을 같게 유지하는 방법을 말합니다. makes the comparison fair는 비교를 공정하게 만든다는 구조입니다.', 'fair', '공정한', '형용사']
  ]);
  add('er4-p2', [
    ['sAmir |vwatches |oa signpost’s shadow |wwhile he waits for the bus each morning.', 'while 시간절', '아미르가 매일 아침 버스를 기다리는 동안 표지판의 그림자를 봅니다. signpost’s는 그림자의 주체를 나타냅니다.', 'signpost', '표지판 기둥', '명사'],
    ['sHe |vreturns |tin the afternoon |nand |vsees |qthat the shadow is shorter and points another way.', 'that절의 두 서술어', '보게 된 내용절 안에서 그림자는 더 짧고 다른 방향을 가리킵니다. is shorter와 points가 같은 주어 the shadow에 연결됩니다.', 'shorter', '더 짧은', '형용사 비교급'],
    ['sThe post |vhas not moved, |nbut |sthe sun |vappears |pin a different part of the sky.', '현재완료 부정', 'has not moved는 앞서 본 뒤로 기둥이 움직이지 않았다는 뜻입니다. 기둥과 달리 태양은 다른 위치에 보입니다.', 'appears', '나타나다, 보이다', '동사'],
    ['sThis daily pattern |vhappens |bbecause Earth rotates from west to east.', 'because 이유절', '그림자의 매일 반복되는 양상이 나타나는 이유를 설명합니다. 지구가 서쪽에서 동쪽으로 회전하기 때문입니다.', 'rotates', '회전하다', '동사'],
    ['sThe changing shadow |vgives |ous |oa clue about a large motion |rthat we cannot feel.', 'give와 관계절', 'us는 단서를 받는 사람이고 a clue는 받는 내용입니다. that we cannot feel은 직접 느끼지 못하는 큰 움직임을 꾸밉니다.', 'clue', '단서', '명사']
  ]);
  add('er4-p3', [
    ['sNina |vwants |oto find out where an ice cube melts faster on a sunny day.', 'where 간접의문문', 'find out의 내용은 얼음이 어디에서 더 빨리 녹는지입니다. where 다음에는 주어 an ice cube와 동사 melts 순서로 씁니다.', 'melts', '녹다', '동사'],
    ['sShe |vputs |otwo ice cubes of the same size |pon two identical plates.', '명사를 꾸미는 of', 'of the same size는 얼음 두 개의 크기가 같음을 설명합니다. identical은 두 접시도 같은 조건이라는 뜻입니다.', 'identical', '똑같은', '형용사'],
    ['sShe |vleaves |oone plate |pin sunlight |nand |othe other |pin the shade.', '반복된 동사 생략', 'and 뒤에는 leaves가 생략되어 있습니다. 한 접시는 햇빛에, 나머지 한 접시는 그늘에 둡니다.', 'shade', '그늘', '명사'],
    ['sBoth plates |vsit |pon the same table, |nand |sshe |vchecks |othem |tevery two minutes.', 'both와 every', 'Both plates는 두 접시 모두를 뜻합니다. every two minutes는 두 분마다 같은 간격으로 확인한다는 뜻입니다.', 'checks', '확인하다', '동사'],
    ['tAfter ten minutes, |sthe ice in sunlight |lhas become |ca small pool of water.', '현재완료 상태 변화', 'has become은 햇빛 속 얼음이 녹아 지금 작은 물웅덩이가 된 결과를 보여 줍니다.', 'pool', '고인 물, 물웅덩이', '명사'],
    ['sThe other plate |vstill has |oa piece of ice |pon it.', 'the other와 a piece of', 'The other plate는 그늘에 둔 나머지 접시입니다. a piece of ice는 아직 남아 있는 얼음 한 조각을 뜻합니다.', 'a piece of', '~ 한 조각', '수량 표현'],
    ['sNina |vrecords |othe result |minstead of changing the cubes during the test.', 'instead of + 동명사', 'instead of changing은 얼음을 바꾸는 대신이라는 뜻입니다. 니나는 실험 중 조건을 바꾸지 않고 결과를 기록합니다.', 'result', '결과', '명사'],
    ['sShe |vplans |oto repeat the test |ito see whether she gets a similar result.', 'whether 간접의문문', 'to see는 시험을 반복하는 목적입니다. whether 뒤는 비슷한 결과가 나오는지 아닌지 확인할 내용을 나타냅니다.', 'similar', '비슷한', '형용사']
  ]);
  add('er4-p4', [
    ['sMom |vwashes |oour clothes |ton Saturday morning.', 'wash의 목적어', 'washes 뒤에는 씻는 대상인 our clothes가 옵니다. on은 토요일 아침처럼 특정한 날의 시간을 나타냅니다.', 'clothes', '옷', '명사'],
    ['sI |vhelp |oher |ehang the wet clothes outside.', 'help + 사람 + 동사 원형', 'help her hang은 엄마가 젖은 옷을 널도록 돕는다는 뜻입니다. hang은 원형으로 쓰였습니다.', 'hang', '널다, 걸다', '동사'],
    ['sThe sun |lis |cwarm, |nand |sa light wind |vis blowing.', '현재진행형', 'is blowing은 바람이 지금 불고 있는 상태입니다. light는 바람이 가볍고 약하다는 뜻으로 wind를 꾸밉니다.', 'light', '약한, 부드러운', '형용사'],
    ['mSlowly, |sthe water in the clothes |vgoes |pinto the air.', '주어를 꾸미는 in 구', 'in the clothes는 어느 물인지 설명합니다. into the air는 옷 속 물이 공기 중으로 이동하는 방향입니다.', 'air', '공기', '명사'],
    ['sThis change |vis called |cevaporation.', '수동태 be called', 'is called는 어떤 이름으로 불린다는 뜻입니다. evaporation은 옷 속 물이 공기 중으로 가는 변화의 이름입니다.', 'evaporation', '증발', '명사'],
    ['tBy lunchtime, |sall of the clothes |lare |cdry.', 'all of와 복수 동사', 'all of the clothes는 옷 모두를 가리켜 are를 씁니다. By lunchtime은 점심때까지는 마른 상태가 된다는 뜻입니다.', 'dry', '마른', '형용사']
  ]);
  add('er4-p5', [
    ['tAfter a hot shower, |sMinho |vcannot see |ohis face |pin the bathroom mirror.', 'cannot + 원형', 'cannot see는 거울에서 얼굴을 볼 수 없다는 뜻입니다. After a hot shower는 그 일이 생긴 때입니다.', 'mirror', '거울', '명사'],
    ['sThe mirror |vis covered |mwith tiny drops of water.', 'be covered with', 'is covered with는 무엇으로 덮여 있다는 수동 표현입니다. 거울 표면을 덮은 것은 작은 물방울들입니다.', 'drops', '방울들', '명사'],
    ['sThe hot shower |vadds |oa lot of water vapor |pto the air.', 'add A to B', '샤워가 많은 수증기를 공기 중에 더한다는 구조입니다. a lot of는 물의 기체 상태인 수증기의 양을 설명합니다.', 'water vapor', '수증기', '명사구'],
    ['sWater vapor |lis |cwater in the form of a gas, |nso |swe |vcannot see |oit.', 'in the form of', '보어 전체는 수증기가 기체 형태의 물이라는 설명입니다. so 뒤에는 눈에 보이지 않는다는 결과가 이어집니다.', 'gas', '기체', '명사'],
    ['wWhen the warm, wet air touches the cool mirror, |sthe vapor |lturns back into |cliquid water.', 'turn into 상태 변화', '따뜻하고 습한 공기가 차가운 거울에 닿을 때 수증기가 다시 액체 물로 변합니다. back은 원래 상태로 돌아감을 나타냅니다.', 'liquid', '액체의', '형용사'],
    ['sThe same thing |vhappens |pon the outside of a glass of cold juice.', 'the same thing의 지시', 'The same thing은 앞 문장의 수증기가 물방울로 바뀌는 현상을 가리킵니다. 차가운 주스 잔 바깥쪽에서도 일어납니다.', 'outside', '바깥쪽', '명사'],
    ['sMinho |vopens |othe window, |nand |tsoon |sthe mirror |lbecomes |cclear again.', 'become + 형용사', 'becomes clear again은 거울이 다시 맑아지는 상태 변화입니다. 창문을 연 동작 뒤에 일어난 결과를 and로 연결합니다.', 'clear', '맑은, 또렷이 보이는', '형용사']
  ]);
  add('er4-p6', [
    ['sJiwoo |vputs |oan orange |pinto a bowl of water, |nand |sit |vfloats.', '대명사 it의 대상', 'it은 물이 아니라 물에 넣은 오렌지를 가리킵니다. floats는 물 위에 뜨다라는 뜻으로 목적어가 없습니다.', 'floats', '물에 뜨다', '동사'],
    ['tThen |sshe |vpeels |othe orange |nand |vputs |oit |mback |pinto the water.', 'peel과 back', 'peels는 껍질을 벗긴다는 동사입니다. back은 껍질을 벗긴 오렌지를 다시 물에 넣는다는 뜻을 더합니다.', 'peels', '껍질을 벗기다', '동사'],
    ['tThis time, |sthe orange |vsinks |pto the bottom of the bowl.', 'sink와 방향', '이번에는 오렌지가 가라앉습니다. to the bottom은 그릇의 바닥까지라는 이동 방향입니다.', 'sinks', '가라앉다', '동사'],
    ['sThe peel |vhas |omany tiny pockets of air |pinside it.', 'pockets of air', 'pockets of air는 공기가 든 작은 공간들을 뜻합니다. inside it의 it은 오렌지 껍질을 가리킵니다.', 'peel', '껍질', '명사'],
    ['sThe air |vmakes |othe whole orange |elight for its size, |nso |sit |vfloats.', 'make + 목적어 + 형용사', '공기가 오렌지 전체를 크기에 비해 가볍게 만듭니다. light는 목적어 orange의 상태를 설명하는 보어입니다.', 'for its size', '그 크기에 비해', '부사구'],
    ['mWithout its peel, |sthe orange |lis |cheavier for its size, |nand |sit |vsinks.', 'without과 비교급', 'Without its peel은 껍질이 없는 조건을 뜻합니다. heavier는 크기에 비해 더 무거운 상태를 설명합니다.', 'heavier', '더 무거운', '형용사 비교급'],
    ['sJiwoo |vwrites |othe result |pin her science notebook.', '기록의 대상과 장소', 'writes의 목적어는 관찰 결과입니다. in her science notebook은 그 결과를 적는 공책을 나타냅니다.', 'result', '결과', '명사']
  ]);
  add('er4-p7', [
    ['tOne summer evening, |sDaniel |vsees |oa bright flash of lightning |pfar away.', 'a flash of', 'a bright flash of lightning은 밝게 번쩍이는 번개 한 번을 뜻합니다. far away는 그것이 먼 곳에 있음을 알려 줍니다.', 'lightning', '번개', '명사'],
    ['tA few seconds later, |she |vhears |oa loud boom of thunder.', 'a few와 복수 명사', 'A few seconds later는 몇 초 뒤라는 뜻입니다. hears의 목적어는 크게 울리는 천둥소리입니다.', 'thunder', '천둥', '명사'],
    ['sLightning and thunder |vhappen |tat the same moment, |nbut |swe |vnotice |othem |tat different times.', 'same과 different 대비', '번개와 천둥이 생기는 순간은 같지만 우리가 알아차리는 시각은 다릅니다. them은 두 현상을 함께 가리킵니다.', 'moment', '순간', '명사'],
    ['sWe |vsee |othe flash |mfirst |bbecause light travels much faster than sound.', 'much + 비교급', 'much faster는 단순히 더 빠른 것보다 훨씬 빠름을 강조합니다. 빛이 소리보다 빠르기에 번쩍임을 먼저 봅니다.', 'much faster', '훨씬 더 빠르게', '부사 비교급'],
    ['sSound |vmoves |pthrough the air |mmore slowly, |nso |sthe thunder |vreaches |ous |tlater.', 'so로 결과 연결', '소리가 공기를 더 느리게 이동하는 것이 원인이고 천둥소리가 나중에 도착하는 것이 결과입니다.', 'reaches', '도달하다', '동사'],
    ['sDaniel |vcounts |othe seconds between the flash and the boom.', 'between A and B', 'between the flash and the boom은 번쩍임과 굉음 사이의 간격을 나타냅니다. 다니엘은 그 간격을 초 단위로 셉니다.', 'counts', '세다', '동사'],
    ['fIf he counts to three, |sthe storm |lis |pabout one kilometer away.', 'if 조건절', '셋까지 셀 정도로 소리가 늦게 들리면 폭풍이 약 1킬로미터 떨어졌다고 추정하는 조건문입니다. about은 대략이라는 뜻입니다.', 'about', '대략, 약', '부사'],
    ['wWhen the time between them gets shorter, |sthe storm |vis coming |pcloser.', 'get + 비교급', 'gets shorter는 번개와 천둥 사이의 시간 간격이 줄어든다는 뜻입니다. is coming closer는 폭풍이 가까워지는 중임을 나타냅니다.', 'closer', '더 가까이', '부사 비교급'],
    ['sDaniel |vwatches |pfrom inside the house |wwhile he counts, |bbecause storms can be dangerous.', 'while과 because 역할', 'while절은 시간을 재는 동시 행동을 나타냅니다. because절은 집 안에서 관찰하는 이유인 폭풍의 위험성을 설명합니다.', 'dangerous', '위험한', '형용사']
  ]);
  add('er5-p1', [
    ['sNari |voften forgets |othe questions |rshe wants to ask after school.', '관계대명사 생략', 'she wants to ask after school은 앞의 questions를 꾸밉니다. 나리가 방과 후에 묻고 싶은 질문들을 자주 잊는다는 뜻입니다.', 'forgets', '잊다', '동사'],
    ['sShe |vputs |oa small notebook |pin her coat pocket.', 'put + 목적어 + 장소', '넣는 대상은 작은 공책이고 넣는 장소는 코트 주머니입니다. puts 뒤의 장소 표현까지 읽어야 행동이 완성됩니다.', 'pocket', '주머니', '명사'],
    ['tOn her way home, |sshe |vsees |oa bird |ecarrying dry grass.', 'see + 목적어 + -ing', 'sees a bird carrying은 새가 마른 풀을 나르는 모습을 본다는 뜻입니다. carrying은 보는 순간 진행 중인 새의 행동을 설명합니다.', 'dry', '마른', '형용사'],
    ['sShe |vwrites |oa question about its nest |pin the notebook.', '명사를 꾸미는 about', 'about its nest는 적는 질문의 주제를 설명합니다. its는 앞 문장에서 본 새를 가리킵니다.', 'nest', '둥지', '명사'],
    ['tThe next day, |sshe |vasks |oher teacher |mabout it.', 'ask 사람 about 주제', '선생님에게 그 질문에 관해 묻는다는 뜻입니다. it은 공책에 적은 새 둥지에 관한 질문을 가리킵니다.', 'The next day', '그다음 날', '부사구'],
    ['tNow |sher questions |vcan wait |msafely |pon paper.', '의인화한 wait', '질문이 종이 위에서 안전하게 기다린다는 말은 공책에 적어 두어 잊지 않고 나중에 물을 수 있다는 뜻입니다.', 'safely', '안전하게, 잊힐 걱정 없이', '부사']
  ]);
  add('er5-p2', [
    ['tAfter art class, |sJisu |vsees |opaint brushes |pbeside a running tap.', 'running의 명사 수식', 'running은 수도꼭지가 물이 나오는 상태임을 설명합니다. 지수는 그 옆에 놓인 붓들을 봅니다.', 'tap', '수도꼭지', '명사'],
    ['sNo one |vis using |othe water, |nso |sshe |vturns |oit |moff.', '대명사와 turn off', 'turn it off처럼 목적어가 대명사이면 turn과 off 사이에 놓습니다. 사용하는 사람이 없어서 물을 잠급니다.', 'turns it off', '그것을 끄다, 여기서는 물을 잠그다', '동사구'],
    ['sShe |vmakes |oa sign |mwith a blue drop and a short message.', 'with의 포함 의미', 'with 뒤는 표지에 들어간 그림과 문구를 설명합니다. 파란 물방울 그림과 짧은 메시지가 있는 표지입니다.', 'sign', '안내 표지', '명사'],
    ['sThe sign |vsays, |d“Turn off the tap after washing.”', '명령문과 after -ing', '안내문의 Turn off는 동사 원형으로 시작하는 명령문입니다. after washing은 씻고 난 뒤라는 시간 정보입니다.', 'Turn off', '끄다, 잠그다', '동사구'],
    ['sShe |vplaces |oit |hwhere students can see it easily.', 'where가 이끄는 장소절', 'where 뒤는 표지를 놓는 장소를 설명합니다. 학생들이 쉽게 볼 수 있는 곳에 둔다는 뜻이며 의문을 묻는 문장은 아닙니다.', 'places', '놓다', '동사'],
    ['sHer class |vdecides |oto check the tap |mbefore leaving the room.', 'before + 동명사', 'before leaving은 교실을 떠나기 전이라는 뜻입니다. decides to check는 수도꼭지를 확인하기로 결정한다는 말입니다.', 'check', '확인하다', '동사']
  ]);
  add('er5-p3', [
    ['sMin |vmakes |oa map |pfrom the bus stop to the school gate.', 'from A to B', 'from the bus stop to the school gate는 지도에 나타낼 출발점과 도착점을 알려 줍니다.', 'gate', '문, 교문', '명사'],
    ['sHe |vdraws |ostreets |nbut |vforgets |othe small path through the park.', 'but으로 빠진 정보 대비', '큰 길은 그리지만 공원을 통과하는 작은 길은 빠뜨립니다. through the park는 작은 길의 경로를 설명합니다.', 'path', '작은 길, 오솔길', '명사'],
    ['sHis new classmate |vfollows |othe map |nand |vtakes |oa long way around.', 'take a long way around', 'takes a long way around는 멀리 돌아간다는 뜻입니다. 지도를 따라갔지만 지름길이 없어 먼 길을 갑니다.', 'classmate', '반 친구', '명사'],
    ['sThey |vwalk |mtogether |tthe next morning |nand |vadd |othe missing path.', 'missing의 명사 수식', 'missing은 지도에 빠져 있는 길을 설명합니다. 두 사람은 다음 날 같이 걸으며 그 길을 지도에 추가합니다.', 'missing', '빠져 있는, 누락된', '형용사'],
    ['sThey |valso mark |oa bench beside it |eas a useful meeting place.', 'mark A as B', 'mark a bench as는 벤치를 어떤 장소로 표시한다는 뜻입니다. beside it의 it은 앞 문장의 길을 가리킵니다.', 'meeting place', '만날 장소', '명사구'],
    ['sMin |vlearns |qthat testing a map can make it clearer.', '동명사 주어와 make', 'that절 안에서 testing a map이 주어입니다. 지도를 시험해 보는 일이 지도를 더 분명하게 만들 수 있다는 뜻입니다.', 'clearer', '더 명확한', '형용사 비교급']
  ]);
  add('er5-p4', [
    ['sOur class |vcloses |oits eyes |tfor one minute |pin the garden.', '집단을 단수로 받는 its', 'Our class를 하나의 학급으로 보아 closes와 its를 씁니다. for one minute는 눈을 감는 시간입니다.', 'closes', '감다, 닫다', '동사'],
    ['sWe |vhear |oleaves |emoving |nand |oa bicycle bell |pnear the gate.', 'hear + 목적어 + -ing', 'hear leaves moving은 나뭇잎이 움직이는 소리를 듣는다는 뜻입니다. and 뒤에서는 자전거 종소리도 듣습니다.', 'leaves', '나뭇잎들', '명사'],
    ['sI |vthink |qa dog is drinking from a bowl.', 'think 뒤 that 생략', 'think 뒤는 소리를 듣고 추측한 내용입니다. is drinking은 개가 그릇의 물을 마시는 중이라고 생각한다는 뜻입니다.', 'bowl', '그릇', '명사'],
    ['wWhen we open our eyes, |swe |vsee |oa gardener |epouring water.', 'see + 목적어 + -ing', '눈을 떴을 때 본 대상은 정원사이고 pouring water는 그 사람이 하는 동작입니다. 물을 붓고 있는 장면을 봅니다.', 'pouring', '붓고 있는', '동사 현재분사'],
    ['sThe water |vmade |othe sound |rI heard.', '관계대명사 생략', 'I heard는 the sound를 꾸미며 내가 들은 소리라는 뜻입니다. 실제 소리를 만든 것은 개가 아니라 물이었습니다.', 'sound', '소리', '명사'],
    ['sMy guess |lwas |cwrong, |nbut |jlistening |vhelped |ome |enotice more.', '동명사 listening 주어', 'listening은 듣는 일이라는 명사 역할을 합니다. 추측은 틀렸지만 듣기가 더 많은 것을 알아차리도록 도왔습니다.', 'guess', '추측', '명사']
  ]);
  add('er5-p5', [
    ['sTwo books |vstand |mapart |pon our science table.', 'apart의 거리 의미', 'apart는 두 책이 떨어져 있다는 뜻입니다. 책 사이 공간을 만들어 종이 다리를 놓는 상황을 알려 줍니다.', 'apart', '떨어져', '부사'],
    ['sA flat sheet of paper between them |vfalls |munder three coins.', '긴 주어의 중심 명사', '주어의 중심은 종이 한 장입니다. between them은 책 사이에 놓인 종이를 꾸미고 under three coins는 동전 무게를 받는 상황입니다.', 'flat', '평평한', '형용사'],
    ['sWe |vfold |oanother sheet |mback and forth |mlike a fan.', 'back and forth', 'back and forth는 앞뒤로 번갈아 접는 방식을 뜻합니다. like a fan은 부채 모양처럼 접는다는 비교입니다.', 'fold', '접다', '동사'],
    ['sThis folded bridge |vholds |omore coins |wbefore it bends.', 'before 시간절', '접어 만든 다리는 휘어지기 전까지 더 많은 동전을 버팁니다. holds는 여기서 무게를 견디는 뜻입니다.', 'bends', '휘어지다', '동사'],
    ['sWe |vuse |othe same kind of paper |ifor both bridges.', 'the same kind of', '두 다리에 같은 종류의 종이를 쓴다는 뜻입니다. 재료를 같게 해서 접은 모양의 영향을 비교할 수 있습니다.', 'both', '둘 다의', '한정사'],
    ['sThe new shape |vmakes |oa difference |mwithout adding more paper.', 'without + 동명사', 'without adding은 종이를 더 보태지 않고라는 뜻입니다. 재료 양이 아니라 새로운 모양만으로 효과가 생깁니다.', 'shape', '모양', '명사']
  ]);
  add('er5-p6', [
    ['sEun’s calendar |vhas |oa club or a lesson |tafter school every day.', 'or로 선택 항목 연결', '달력에는 매일 방과 후 동아리나 수업이 들어 있습니다. or는 일정에 들어가는 두 종류의 활동을 연결합니다.', 'calendar', '달력, 일정표', '명사'],
    ['tBy Friday, |sshe |lfeels |ctoo tired |zto enjoy drawing.', 'too ~ to', 'too tired to enjoy는 너무 피곤해서 그림 그리기를 즐기기 어렵다는 뜻입니다. drawing은 enjoy의 대상인 동명사입니다.', 'tired', '피곤한', '형용사'],
    ['sShe |vtalks |pwith her father |mabout keeping Wednesday afternoon free.', '전치사 뒤 동명사', 'about 뒤의 keeping은 수요일 오후를 비워 두는 일이라는 명사 역할을 합니다. free는 그 오후에 일정이 없는 상태입니다.', 'free', '예정된 일이 없는', '형용사'],
    ['sThey |vleave |othat square |eempty |pon the calendar.', 'leave + 목적어 + 형용사', 'leave that square empty는 달력의 그 칸을 비워 둔다는 뜻입니다. empty는 칸의 상태를 나타내는 목적격 보어입니다.', 'empty', '빈', '형용사'],
    ['sEun |vuses |oit |ito rest, read, or draw |mwithout a plan.', '목적의 to부정사 병렬', 'to 뒤에 rest, read, draw가 나란히 연결됩니다. 은이는 비워 둔 시간을 쉬거나 읽거나 그리는 데 씁니다.', 'rest', '쉬다', '동사'],
    ['sAn empty space |lbecomes |can important part of her week.', 'become + 명사 보어', 'an important part는 빈 시간이 무엇이 되었는지 설명하는 보어입니다. 일정 없는 시간이 한 주의 중요한 부분이 됩니다.', 'important', '중요한', '형용사']
  ]);
  add('er6-p1', [
    ['sThe neighbors |vput |osix flower pots |pbeside their shared stairs.', '장소를 나타내는 beside', 'beside their shared stairs는 함께 쓰는 계단 옆이라는 위치입니다. 놓는 대상은 화분 여섯 개입니다.', 'shared', '함께 쓰는', '형용사'],
    ['tAt first, |severyone |vthinks |qanother person will water them.', 'think 뒤 내용절', '모두가 다른 사람이 물을 줄 것이라고 생각합니다. them은 앞 문장의 화분들을 가리키고 water는 물을 주다는 동사입니다.', 'another person', '다른 사람', '명사구'],
    ['tSoon |sthe soil |lbecomes |cdry.', 'become + 형용사', 'becomes dry는 흙이 마르는 상태 변화입니다. 아무도 맡지 않은 결과가 Soon이라는 시간 표현과 함께 드러납니다.', 'soil', '흙', '명사'],
    ['sEach neighbor |vwrites |oa name |pon one pot.', 'each + 단수 명사', 'Each neighbor는 이웃 사람 한 명 한 명을 뜻해서 writes를 씁니다. 각자 화분 하나에 이름을 적습니다.', 'Each', '각각의', '한정사'],
    ['tNow |seach person |vtakes care of |othat pot |tevery morning.', 'take care of', 'takes care of는 돌본다는 뜻의 묶음 표현입니다. that pot은 자기 이름을 쓴 화분을 가리킵니다.', 'takes care of', '돌보다', '동사구'],
    ['sThe flowers |vgrow |mwell |bbecause the jobs are clear.', 'because 이유절', '꽃이 잘 자라는 이유는 각자의 일이 분명해졌기 때문입니다. well은 자라는 상태를 설명하는 부사입니다.', 'clear', '명확한', '형용사']
  ]);
  add('er6-p2', [
    ['sA wheel |vcomes off |oHoon’s toy truck |pat the playground.', 'come off', 'comes off는 붙어 있던 것이 떨어진다는 뜻입니다. 놀이터에서 훈이의 장난감 트럭 바퀴가 빠집니다.', 'wheel', '바퀴', '명사'],
    ['sHe |vcannot find |oit |pin the sand.', '대명사 it', 'it은 앞에서 빠진 바퀴입니다. cannot find는 모래 속에서 바퀴를 찾지 못한다는 뜻입니다.', 'sand', '모래', '명사'],
    ['sAn older child |vbrings |oa spare wheel |pfrom a broken toy.', 'spare와 broken', 'spare는 대신 쓸 수 있는 여분의 바퀴를 뜻합니다. from a broken toy는 바퀴를 가져온 곳을 설명합니다.', 'spare', '여분의, 대체용의', '형용사'],
    ['sIt |vfits, |nand |sHoon |vthanks |oher.', '목적어 없이 쓰인 fit', 'fits는 바퀴의 크기가 맞는다는 뜻으로 쓰였습니다. her는 바퀴를 가져다준 아이를 가리킵니다.', 'fits', '크기가 맞다', '동사'],
    ['tThe next week, |sHoon |vhelps |oa younger child |efind a lost bucket.', 'help + 사람 + 동사 원형', '훈이가 더 어린 아이를 도와 잃어버린 양동이를 찾습니다. find는 helps 뒤 목적어 child의 행동을 설명합니다.', 'bucket', '양동이', '명사'],
    ['sHe |vremembers |hhow a little help made his own day better.', 'how절과 make', 'how 뒤는 작은 도움이 자기 하루를 어떻게 낫게 만들었는지에 관한 기억입니다. better는 his own day의 달라진 상태입니다.', 'better', '더 좋은', '형용사 비교급']
  ]);
  add('er6-p3', [
    ['sSome children |vwant |oto ask questions |tduring the library’s quiet hour.', 'want to와 during', '아이들이 원하는 일은 질문하는 것입니다. during은 도서관에서 조용히 지내야 하는 시간 중이라는 범위를 나타냅니다.', 'quiet hour', '조용히 지내는 시간', '명사구'],
    ['jCalling across the room |vwould disturb |oother readers.', '동명사 주어와 would', 'Calling across the room은 방 건너편으로 소리쳐 부르는 일입니다. would는 그렇게 한다면 독자들을 방해할 것이라는 예상을 나타냅니다.', 'disturb', '방해하다', '동사'],
    ['sThe librarian |vgives |oeach table |oa yellow ribbon.', 'give의 두 목적어', 'each table은 리본을 받는 각 테이블이고 a yellow ribbon은 주는 물건입니다. 테이블마다 리본을 하나씩 나눠 줍니다.', 'librarian', '사서', '명사'],
    ['sChildren |vplace |oit |pon the table edge |wwhen they need help.', 'when 시간절', '아이들은 도움이 필요할 때 리본을 테이블 가장자리에 놓습니다. it은 사서에게 받은 노란 리본을 가리킵니다.', 'edge', '가장자리', '명사'],
    ['sThe librarian |vwalks over |nand |vspeaks |min a soft voice.', 'in a ~ voice', 'in a soft voice는 낮고 부드러운 목소리로 말하는 방식입니다. walks over는 아이가 있는 곳으로 다가오는 행동입니다.', 'soft voice', '부드럽고 작은 목소리', '명사구'],
    ['sThe ribbon |vlets |ochildren |eask for help |wwhile others keep reading.', 'let + 목적어 + 동사 원형', 'lets children ask는 아이들이 도움을 요청할 수 있게 한다는 뜻입니다. while 뒤는 다른 사람들이 계속 읽는 동시 상황입니다.', 'keep reading', '계속 읽다', '동사구']
  ]);
  add('er6-p4', [
    ['sOur cooking club |vmakes |ovegetable noodles |ifor lunch.', 'for의 용도', 'for lunch는 점심 식사로 먹기 위해 만든다는 뜻입니다. makes의 목적어는 채소 국수입니다.', 'vegetable', '채소의', '형용사'],
    ['sSome students |vtake |otoo much |nand |vleave |ofood |pin their bowls.', 'too much의 생략된 명사', 'too much 뒤에는 앞 문장의 국수라는 말이 생략되어 있습니다. 지나치게 많이 가져와 그릇에 음식을 남깁니다.', 'too much', '너무 많은 양', '대명사구'],
    ['tOn the next cooking day, |swe |vuse |osmaller bowls.', '비교급 smaller', 'smaller는 앞의 조리 시간에 쓰던 것보다 작은 그릇이라는 뜻입니다. 다음 조리 날에 그릇 크기를 바꿉니다.', 'smaller', '더 작은', '형용사 비교급'],
    ['sEveryone |vcan return |ifor more noodles |fif they are still hungry.', 'if 조건절', '여전히 배가 고프면 국수를 더 받으러 돌아올 수 있다는 조건문입니다. they는 everyone을 받아 각 사람을 가리킵니다.', 'return', '다시 오다', '동사'],
    ['sWe |vleave |oless food, |nbut |snobody |vhas to stay |chungry.', 'has to와 nobody', 'has to는 해야 한다는 뜻이지만 nobody가 주어여서 누구도 배고픈 채 있어야 할 필요가 없다는 의미가 됩니다.', 'less', '더 적은', '한정사 비교급'],
    ['sA small first serving |vhelps |ous |echoose how much we need.', 'how much 간접의문문', 'how much we need는 우리가 얼마나 필요한지라는 내용입니다. 처음에 적게 받으면 필요한 양을 선택하기가 쉬워집니다.', 'serving', '음식을 한 번 담아 주는 양', '명사']
  ]);
  add('er6-p5', [
    ['sThe music club |vplans |oa song |ifor the school festival.', 'plan의 목적어', '음악 동아리가 계획하는 것은 학교 축제에서 할 노래입니다. for the school festival은 노래를 준비하는 목적입니다.', 'festival', '축제', '명사'],
    ['sHana |vlikes |osinging with friends |nbut |vfears |osinging alone.', '동명사 목적어의 대조', 'singing with friends와 singing alone은 각각 likes와 fears의 목적어입니다. 함께 부르기는 좋아하지만 혼자 부르기는 두려워합니다.', 'alone', '혼자', '부사'],
    ['sHer team |vlets |oher |ekeep the beat with a small drum.', 'let + 사람 + 동사 원형', 'lets her keep은 하나가 박자를 맞추도록 해 준다는 뜻입니다. with a small drum은 작은 북을 쓰는 수단입니다.', 'beat', '박자', '명사'],
    ['sShe |vpractices |oit |tevery afternoon |wwhile her friends sing.', 'while로 역할의 동시 진행', '하나가 북 박자를 연습하는 동안 친구들은 노래합니다. it은 앞 문장에서 정한 박자 맞추기 역할을 가리킵니다.', 'practices', '연습하다', '동사'],
    ['tOn festival day, |sher steady beat |vhelps |oeveryone |estart together.', 'help + 사람 + 동사 원형', '하나의 일정한 박자가 모두 함께 시작할 수 있도록 돕습니다. start together는 목적어 everyone이 하는 동작입니다.', 'steady', '일정한, 흔들림 없는', '형용사'],
    ['sHana |lis |cproud |mof being part of the music.', 'be proud of + 동명사', 'proud of는 자랑스러워한다는 뜻입니다. of 뒤의 being은 음악의 일부가 되는 일이라는 명사 역할을 합니다.', 'proud', '자랑스러운', '형용사']
  ]);
  add('er6-p6', [
    ['sThe bus stop |vhas |oa timetable |mwith very small numbers.', 'with의 명사 수식', 'with very small numbers는 시간표의 특징을 설명합니다. 버스 정류장 시간표의 숫자가 매우 작다는 뜻입니다.', 'timetable', '시간표', '명사'],
    ['sAra |vnotices |oan older neighbor |eholding it close to his face.', 'notice + 목적어 + -ing', '아라가 알아차린 것은 이웃이 시간표를 얼굴 가까이 들고 있는 모습입니다. holding은 그 이웃의 진행 중인 동작입니다.', 'holding', '들고 있는', '동사 현재분사'],
    ['sShe |vasks |othe bus office |mfor a large-print copy.', 'ask A for B', 'asks the bus office for는 버스 담당 사무소에 무언가를 요청한다는 뜻입니다. 요청한 것은 큰 글씨로 인쇄한 시간표입니다.', 'large-print', '큰 글씨로 인쇄된', '형용사'],
    ['sA worker |vchecks |othe times |mbefore putting the new copy on the wall.', 'before + 동명사', 'before putting은 새 시간표를 벽에 붙이기 전이라는 뜻입니다. 먼저 시간 정보가 맞는지 확인합니다.', 'copy', '인쇄본, 사본', '명사'],
    ['sChildren and visitors |valso find |othe larger numbers |eeasier to read.', 'find + 목적어 + 형용사', 'find the larger numbers easier는 더 큰 숫자가 더 읽기 쉽다고 느낀다는 구조입니다. to read는 어떤 점에서 쉬운지 보충합니다.', 'easier', '더 쉬운', '형용사 비교급'],
    ['sA change for one neighbor |vhelps |omany travelers.', '주어를 꾸미는 for 구', 'for one neighbor는 누구를 위한 변화인지를 설명합니다. 한 이웃을 위한 변화가 많은 이용자에게 도움이 된다는 뜻입니다.', 'travelers', '이동하는 사람들, 이용자들', '명사']
  ]);
  root.EnglishReadingSentenceNotes = Object.assign(root.EnglishReadingSentenceNotes || {}, notes);
})(typeof window !== 'undefined' ? window : globalThis);
