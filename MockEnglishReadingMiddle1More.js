(function (root) {
    'use strict';
    // 중1(middle1) 모의고사 전용 영어 독해 추가 12지문(mock-en-middle1-c ~ n). 모두 자체 창작이며 인물·장소·수치는 가상이다.
    // MockEnglishTransfer.js 뒤에 로드해야 한다. 같은 배열(root.MockEnglishTransfer)에 이어 붙인다.
    // evidenceLines는 lines의 0 기반 인덱스이고, 문항 속 "sentence N"/"line N"은 1 기반 번호다.
    const passages = Array.isArray(root.MockEnglishTransfer) ? root.MockEnglishTransfer : (root.MockEnglishTransfer = []);
    function add(gradeId, variant, title, lines, glossary, rows) {
        const id = `mock-en-${gradeId}-${variant}`;
        if (passages.some(p => p.id === id)) return;
        passages.push({ id, gradeId, title, lines, glossary: glossary.map(([word,meaning]) => ({word,meaning})), grammarProfile: 'grade-aligned-reading',
            questions: rows.map((row,index) => {
                const [skill,question,answer,a,b,c,explanation,evidenceLines,difficulty='standard'] = row;
                const choices = [answer,a,b,c];
                const shift = (index + gradeId.length + variant.charCodeAt(0)) % 4;
                return {id:`${id}-q${index+1}`,skill,question,answer,choices:choices.slice(shift).concat(choices.slice(0,shift)),explanation,evidenceLines,difficulty,cognitiveDemand:difficulty==='challenge'?'reasoning':'application'};
            }) });
    }

    // 1주 1회 · 안내문/규칙
    add('middle1','c','Rules for the Quiet Reading Room',[
        'The Quiet Reading Room on the third floor of the library opens again on Monday.',
        'Students may use it from 8:30 a.m. to 4:30 p.m. on school days.',
        'Please keep your voice low, and turn your phone to silent mode before you come in.',
        'Food is not allowed in the room, but you may bring water in a bottle with a lid.',
        'Each student can book a desk for up to two hours a day.',
        'To book a desk, write your name and time on the sheet at the front counter.',
        'If you leave your desk for more than twenty minutes, another student may use it.',
        'Books from this room must stay here, so please put them back on the cart when you finish.',
        'Thank you for helping us keep the room quiet and clean.'
    ],[['lid','뚜껑'],['counter','접수대'],['cart','(바퀴 달린) 책 수레']], [
        ['fact','Until what time can students use the room on school days?','4:30 p.m.','8:30 a.m.','3:30 p.m.','5:30 p.m.','두 번째 문장에 오전 8시 30분부터 오후 4시 30분까지라고 나옵니다. 8:30 a.m.은 여는 시각이지 마감 시각이 아닙니다.',[1]],
        ['main','What is the main purpose of this notice?','To explain how to use the reading room.','To invite students to a reading contest.','To ask students to buy new library books.','To explain why the room was closed before.','이용 시간, 소리, 음식, 자리 예약, 책 정리 등 열람실 이용 방법을 안내합니다. “opens again”이라는 말은 있지만 왜 닫혔었는지는 설명하지 않습니다.',[0,2,3,4,7]],
        ['reference','What does “them” in sentence 8 refer to?','The books from this room.','The students in the room.','The desks on the third floor.','The bottles with lids.','수레에 다시 꽂아 두어야 하는 것은 같은 문장 앞부분의 Books from this room입니다. 학생이나 책상을 수레에 올려놓을 수는 없습니다.',[7]],
        ['vocabulary','What does “book” in sentence 5 mean?','To save a place ahead of time.','To read a story for a long time.','To write a report about a book.','To borrow a book from the counter.','여기서 book은 ‘책’이 아니라 동사 ‘예약하다’입니다. 6번 문장에서 이름과 시간을 적어 책상을 맡아 두는 방법을 설명하므로 미리 자리를 잡아 두는 뜻입니다. 책을 빌린다는 선택지는 명사 뜻에 끌린 오답입니다.',[4,5]],
        ['inference','Jisu books a desk from 1:00 to 3:00 p.m. on Tuesday. Which plan follows all the rules?','Bring a water bottle with a lid and put the books back on the cart.','Book another desk from 3:00 to 4:00 p.m. on the same day.','Eat a sandwich quietly at her desk while she studies.','Take a book from the room home and finish it at night.','뚜껑 있는 물병은 허용되고 책은 수레에 돌려놓아야 하므로 첫 계획만 모든 규칙을 지킵니다. 이미 2시간을 예약했으므로 같은 날 1시간을 더 예약하면 하루 2시간 제한을 넘습니다.',[3,4,7],'challenge'],
        ['inference','Minho leaves his booked desk at 2:00 and comes back at 2:30. What might happen?','Another student may be using his desk.','The room may already be closed for the day.','His booking time may become one hour longer.','His phone may be taken to the front counter.','2:00에서 2:30까지는 30분으로 20분을 넘었으므로 다른 학생이 그 자리를 쓸 수 있습니다. 열람실은 4:30까지 열기 때문에 이미 닫혔다는 선택지는 틀립니다.',[1,6],'challenge'],
        ['evidence','A student says, “I can take a book from this room home and bring it back tomorrow.” Which sentence shows that this is wrong?','Sentence 8.','Sentence 4.','Sentence 6.','Sentence 2.','8번 문장에서 이 방의 책은 이곳에 있어야 한다고 했으므로 집에 가져갈 수 없습니다. 6번 문장은 책이 아니라 책상 예약 방법입니다.',[7],'challenge']
    ]);

    // 1주 2회 · 이메일
    add('middle1','d','A Question for Ms. Han',[
        'Hello Ms. Han, this is Seoyeon from Class 1-3.',
        'I am writing to ask about our science project on plants.',
        'You said each group should give a five-minute talk next Friday.',
        'However, my partner Daniel broke his arm last weekend, and he cannot write for a while.',
        'He can still help with the talk, but I will make our poster by myself.',
        'Could we give our talk on the following Monday instead?',
        'That would give me a little more time to finish the poster.',
        'If that is not possible, we will do our best to be ready on Friday.',
        'Thank you for reading my email. Best wishes, Seoyeon'
    ],[['partner','짝, 함께 하는 사람'],['following','그다음의'],['possible','가능한']], [
        ['fact','When should each group give its talk in Ms. Han’s first plan?','Next Friday.','Last weekend.','Next Monday.','This Thursday.','3번 문장에서 선생님이 다음 주 금요일에 발표하라고 했습니다. 다음 월요일은 서연이가 새로 부탁한 날짜입니다.',[2]],
        ['main','Why did Seoyeon write this email?','To ask for a later date for their talk.','To say that Daniel will leave the group.','To ask the teacher to make their poster.','To change the project topic to animals.','2번 문장에서 프로젝트에 관해 묻는다고 하고, 6번 문장에서 발표를 다음 월요일로 미룰 수 있는지 부탁합니다. Daniel은 팔을 다쳤을 뿐 모둠을 떠나지 않습니다.',[1,5]],
        ['reference','What does “That” in sentence 7 refer to?','Giving the talk on the following Monday.','Daniel breaking his arm last weekend.','Making the poster without any help.','Giving a five-minute talk on Friday.','포스터를 끝낼 시간을 더 주는 것은 바로 앞 6번 문장의 ‘다음 월요일에 발표하기’입니다. 금요일 발표는 오히려 시간이 더 적습니다.',[5,6]],
        ['vocabulary','What does “for a while” in sentence 4 mean?','For some time.','For one minute.','Forever.','At the same time.','for a while은 ‘한동안, 얼마 동안’이라는 뜻입니다. 팔이 나을 때까지 한동안 글을 쓸 수 없다는 말이므로 영원히(Forever)도, 1분도 아닙니다.',[3]],
        ['inference','Ms. Han says no to the new date. What will Seoyeon’s group most likely do?','Try to be ready for the talk on Friday.','Give up the science project completely.','Ask Daniel to write the poster by hand.','Give the talk on Monday without asking.','8번 문장에서 안 된다면 금요일에 맞추려고 최선을 다하겠다고 했습니다. Daniel은 지금 글을 쓸 수 없으므로 그에게 포스터를 쓰게 한다는 선택지는 맞지 않습니다.',[7],'challenge'],
        ['inference','Why will Seoyeon make the poster by herself?','Daniel cannot write because of his arm.','Daniel does not want to join the talk.','Ms. Han asked her to work all alone.','The poster is due earlier than the talk.','Daniel이 팔이 부러져 한동안 글을 쓸 수 없기 때문입니다. 5번 문장에서 Daniel은 발표는 여전히 도울 수 있다고 했으므로 발표에 참여하기 싫다는 것은 틀립니다.',[3,4]],
        ['evidence','Which sentence best shows that Seoyeon is not refusing the teacher’s first plan?','Sentence 8.','Sentence 3.','Sentence 6.','Sentence 5.','8번 문장은 날짜 변경이 안 되면 원래대로 금요일에 준비하겠다고 말하므로 원래 계획을 거부하지 않는다는 근거입니다. 6번 문장은 날짜 변경을 부탁하는 문장일 뿐입니다.',[7],'challenge']
    ]);

    // 1주 3회 · 짧은 이야기
    add('middle1','e','Just Keep Going',[
        'Yuri had practiced the same piano piece every day for two months.',
        'On the day of the school concert, her hands were cold, and her heart was beating fast.',
        'In the middle of the piece, she played a wrong note.',
        'For a second, she wanted to stop and run off the stage.',
        'Then she remembered her teacher’s advice: “If you make a mistake, just keep going.”',
        'She took a deep breath and played to the end without stopping.',
        'When she finished, the audience clapped loudly.',
        'After the concert, her friend Dami said, “I didn’t even notice the mistake!”',
        'Yuri laughed and wrote her teacher’s words on the first page of her practice notebook.'
    ],[['advice','조언'],['audience','관객'],['clapped','박수를 쳤다']], [
        ['fact','How long had Yuri practiced the piece?','For two months.','For two weeks.','For one year.','For two days.','1번 문장에서 두 달 동안 매일 연습했다고 나옵니다.',[0]],
        ['main','What lesson does Yuri learn in the story?','A small mistake does not have to stop you.','Practicing every day stops all mistakes.','Cold hands make piano playing hard.','Good friends always notice our mistakes.','틀린 음을 냈지만 멈추지 않고 끝까지 연주해 박수를 받았고, 그 조언을 공책에 적습니다. 매일 연습했는데도 실수했으므로 ‘연습하면 실수가 없다’는 틀립니다.',[2,4,5,6,8]],
        ['reference','What does “the mistake” in sentence 8 refer to?','The wrong note in the middle of the piece.','Running off the stage after the concert.','Forgetting her teacher’s advice that day.','Clapping too loudly at the end of it.','Dami가 알아채지 못한 실수는 3번 문장에서 곡 중간에 친 틀린 음입니다. 유리는 무대에서 도망치고 싶었을 뿐 실제로 도망치지 않았습니다.',[2,7]],
        ['vocabulary','What does “keep going” in sentence 5 mean?','Continue without stopping.','Go back home right away.','Keep the same seat.','Start again from the beginning.','keep going은 ‘멈추지 말고 계속하다’입니다. 6번 문장에서 멈추지 않고 끝까지 연주한 것으로 확인됩니다. 처음부터 다시 시작한다는 뜻이 아닙니다.',[4,5]],
        ['inference','How did Yuri most likely feel just before she played?','A little nervous.','Calm and relaxed.','Bored and sleepy.','Angry at a friend.','손이 차갑고 심장이 빨리 뛰었다는 2번 문장에서 긴장했음을 알 수 있습니다. 차분하고 편안했다는 것과는 반대입니다.',[1],'challenge'],
        ['vocabulary','What does “piece” mean in sentence 1?','A work of music.','A small part of a cake.','A broken bit of glass.','A part of a puzzle.','piece는 ‘조각’ 외에 ‘(음악·미술) 작품, 곡’이라는 뜻도 있습니다. 피아노로 연습하고 연주하는 대상이므로 곡을 뜻합니다.',[0,2]],
        ['evidence','Which detail best shows that her teacher’s advice worked?','She played to the end, and Dami did not notice the mistake.','She practiced every day for two whole months.','Her hands were cold before the concert began.','She wanted to run off the stage for a second.','조언대로 멈추지 않고 끝까지 연주했고(6번), 친구가 실수를 알아채지도 못했습니다(8번). 두 달 연습은 조언을 듣기 전의 일이므로 조언의 효과를 보여 주지 않습니다.',[5,7],'challenge']
    ]);

    // 2주 1회 · 설명문
    add('middle1','f','Why Do Leaves Change Color?',[
        'In many places, the leaves of trees turn yellow, orange, or red in autumn.',
        'But where do these colors come from?',
        'During spring and summer, leaves are full of a green material called chlorophyll.',
        'Leaves use it to make food from sunlight, water, and air.',
        'Leaves also have yellow and orange colors, but the strong green usually covers them.',
        'In autumn, the days get shorter, and many trees stop making new chlorophyll.',
        'As the green slowly disappears, the yellow and orange colors can finally be seen.',
        'Some trees, like many maples, also make new red colors in autumn.',
        'So, in a way, many autumn colors were in the leaves all summer long.'
    ],[['material','물질'],['chlorophyll','엽록소'],['maple','단풍나무']], [
        ['fact','When do many trees stop making new chlorophyll?','In autumn, when days get shorter.','In spring, when new leaves grow.','In summer, when days are long.','In winter, after the leaves fall.','6번 문장에서 가을에 낮이 짧아지면 새 엽록소를 만들지 않는다고 했습니다.',[5]],
        ['main','What is the passage mainly about?','How leaves get their autumn colors.','How to grow maple trees at home.','Why trees need water in summer.','Which tree has the reddest leaves.','2번 문장의 질문(색은 어디서 오는가)에 엽록소가 사라지며 노란색·주황색이 드러나고 일부 나무는 붉은색을 새로 만든다고 답하는 글입니다. 단풍나무는 예시일 뿐 키우는 방법은 나오지 않습니다.',[1,4,6,7]],
        ['reference','What does “them” in sentence 5 refer to?','The yellow and orange colors.','The trees in the summer.','The short days in autumn.','The sunlight and the water.','강한 초록색이 덮어 가리는 것은 같은 문장 앞의 yellow and orange colors입니다. 7번 문장에서 초록이 사라지자 그 색들이 보인다는 것으로도 확인됩니다.',[4,6]],
        ['vocabulary','What does “covers” in sentence 5 mean?','Hides something from view.','Makes something grow bigger.','Turns something into food.','Takes something away forever.','초록색이 노란색·주황색 위에 있어 보이지 않게 가린다는 뜻입니다. 7번 문장에서 초록이 사라지면 그 색들이 다시 보이므로 영원히 없앤다는 뜻이 아닙니다.',[4,6]],
        ['inference','A tree’s leaves turn yellow in autumn. What is true about the yellow color?','It was in the leaves during summer too.','The tree made it only in the autumn.','It comes from the water the tree drinks.','It means the tree is making more chlorophyll.','노란색은 여름에도 잎 속에 있었지만 초록에 가려져 있었습니다(5·9번). 가을에 새로 만드는 것은 일부 나무의 붉은색입니다(8번).',[4,7,8],'challenge'],
        ['inference','In which leaf can yellow and orange colors be seen most easily?','A leaf that has lost most of its green.','A leaf full of chlorophyll in summer.','A leaf that is making new chlorophyll.','A leaf with strong green in spring.','초록(엽록소)이 사라질수록 노란색과 주황색이 보입니다(7번). 엽록소가 많은 잎은 초록이 그 색들을 가립니다.',[4,6],'challenge'],
        ['evidence','Which sentence shows that NOT all autumn colors were in the leaves during summer?','Sentence 8.','Sentence 5.','Sentence 7.','Sentence 1.','8번 문장은 일부 나무가 가을에 붉은색을 새로 만든다고 하므로 모든 가을 색이 여름부터 있던 것은 아님을 보여 줍니다. 5번과 7번은 원래 있던 노란색·주황색에 관한 문장입니다.',[7],'challenge']
    ]);

    // 2주 2회 · 의견글
    add('middle1','g','A Shelf for Sharing',[
        'Every March, many students buy new pencil cases, rulers, and notebooks.',
        'At the same time, many old but useful supplies end up in the trash.',
        'I think our school should set up a swap shelf in the hallway.',
        'Students could leave things they no longer need and take things they can use.',
        'This would save money for families, and it would also reduce waste.',
        'Some people may worry that the shelf will become messy.',
        'To solve this problem, our class can take turns checking it every Friday.',
        'Broken or dirty items would not be allowed on the shelf.',
        'A small shelf like this can teach us that “used” does not mean “useless.”'
    ],[['supplies','학용품'],['swap','서로 바꾸는'],['reduce','줄이다'],['useless','쓸모없는']], [
        ['fact','How often will the class check the shelf, according to the writer?','Every Friday.','Every March.','Every morning.','Twice a month.','7번 문장에서 금요일마다 돌아가며 확인하겠다고 했습니다. March는 새 학용품을 사는 때입니다.',[6]],
        ['main','What is the writer’s main opinion?','The school should have a shelf for sharing used supplies.','Students should buy new supplies every March.','Broken supplies should be fixed in the hallway.','Families should spend more money on notebooks.','3번 문장의 I think 뒤에 글쓴이의 주장(복도에 교환 선반을 두자)이 나오고 나머지 문장은 그 이유와 운영 방법입니다.',[2,3,4]],
        ['reference','What does “it” in sentence 7 refer to?','The swap shelf.','The hallway trash can.','The class schedule.','The new pencil case.','금요일마다 돌아가며 확인(점검)하는 대상은 6번 문장에서 지저분해질까 걱정한 교환 선반입니다.',[5,6]],
        ['vocabulary','What does “end up” in sentence 2 mean?','Finally go to a place.','Start to be used again.','Stand at the end of a line.','Become new and clean.','end up은 ‘결국 ~에 이르게 되다’라는 뜻입니다. 쓸 만한 학용품이 결국 쓰레기통으로 간다는 말이며, 다시 쓰인다는 뜻과는 반대입니다.',[1]],
        ['inference','Which item could a student put on the swap shelf?','A clean ruler that she no longer needs.','A broken pencil case with no zipper.','A dirty notebook with torn pages.','A new eraser she still uses every day.','더 이상 필요 없는 물건을 두되(4번) 망가지거나 더러운 것은 안 됩니다(8번). 지우개는 아직 매일 쓰므로 필요 없는 물건이 아닙니다.',[3,7],'challenge'],
        ['inference','Why does the writer mention that the shelf might become messy?','To answer a worry that others may have.','To show that the idea will never work.','To ask the school to buy a bigger shelf.','To explain why supplies end up in the trash.','예상되는 걱정(6번)을 먼저 꺼내고 바로 해결책(7·8번)을 제시하여 주장을 강하게 만듭니다. 글쓴이는 계속 선반을 찬성하므로 ‘안 될 것이다’는 틀립니다.',[5,6,7],'challenge'],
        ['evidence','Which sentence gives the best reason that supports the writer’s idea?','Sentence 5.','Sentence 1.','Sentence 6.','Sentence 8.','5번 문장은 돈을 아끼고 쓰레기를 줄인다는 장점, 즉 주장의 이유를 제시합니다. 6번은 반대 측 걱정이고 8번은 선반 이용 규칙입니다.',[4],'challenge']
    ]);

    // 2주 3회 · 일정 안내
    add('middle1','h','Our Trip to the Science Museum',[
        'On May 14, Class 1-2 will visit the City Science Museum.',
        'The bus leaves the school gate at 9:00 a.m., so please arrive by 8:50.',
        'From 10:00 to 11:30, students will visit the Space Hall in two groups.',
        'Group A will start with the planet show, and Group B will start with the rocket room.',
        'After forty-five minutes, they will switch places.',
        'Lunch is from 11:30 to 12:30 in the museum garden, so bring your own lunch and a mat.',
        'In the afternoon, everyone will join a hands-on robot class until 2:30.',
        'The bus will leave the museum at 3:00 and arrive back at school at about 4:00.',
        'If it rains, we will have lunch in the museum lobby instead.'
    ],[['switch','서로 바꾸다'],['mat','돗자리'],['hands-on','직접 해 보는'],['lobby','로비(건물 입구의 넓은 공간)']], [
        ['fact','By what time should students arrive at the school gate?','By 8:50 a.m.','By 9:00 a.m.','By 10:00 a.m.','By 8:30 a.m.','2번 문장에서 버스는 9시에 떠나니 8시 50분까지 오라고 했습니다. 9:00은 버스가 출발하는 시각입니다.',[1]],
        ['main','What is the main purpose of this text?','To tell students the plan for a class trip.','To explain how rockets fly into space.','To invite parents to a robot class.','To ask students to vote for a museum.','날짜, 출발 시각, 관람 순서, 점심, 귀가 시각 등 현장 체험 학습 일정을 알려 주는 글입니다.',[0,1,2,5,7]],
        ['reference','Who does “they” in sentence 5 refer to?','Group A and Group B.','The teachers and drivers.','The planets and rockets.','Class 1-2 and its parents.','45분 뒤 서로 장소를 바꾸는 것은 4번 문장의 두 모둠 Group A와 Group B입니다.',[3,4]],
        ['vocabulary','What does “leaves” in sentence 2 mean?','Goes away from a place.','The green parts of a plant.','Gives something to someone.','Stops for a short time.','leave는 ‘떠나다, 출발하다’라는 동사입니다. 여기서 leaves는 나뭇잎(leaf의 복수)이 아니라 버스가 9시에 학교 문을 출발한다는 뜻입니다.',[1]],
        ['inference','At what time will Group B move from the rocket room to the planet show?','10:45 a.m.','10:30 a.m.','11:00 a.m.','11:30 a.m.','Space Hall 관람은 10:00에 시작하고 45분 뒤 장소를 바꾸므로 10:45입니다. 11:30은 Space Hall 관람이 끝나는 시각입니다.',[2,3,4],'challenge'],
        ['inference','A parent wants to pick up her child at school after the trip. Which time is best?','About 4:00 p.m.','About 2:30 p.m.','About 3:00 p.m.','About 12:30 p.m.','버스가 박물관을 3:00에 떠나 학교에 4:00쯤 도착합니다. 3:00은 박물관을 출발하는 시각이라 학교에는 아직 도착하지 않았습니다.',[6,7],'challenge'],
        ['evidence','Which sentence tells students why they need to bring a mat?','Sentence 6.','Sentence 7.','Sentence 8.','Sentence 9.','6번 문장에서 점심을 박물관 정원에서 먹으므로 도시락과 돗자리를 가져오라고 했습니다. 9번은 비가 오면 로비에서 먹는다는 예외 안내입니다.',[5],'challenge']
    ]);

    // 3주 1회 · 대화문
    add('middle1','i','A Gift for Grandpa',[
        'Sora: Grandpa’s birthday is this Saturday. What should we get him?',
        'Jun: How about a new phone? His old one is very slow.',
        'Sora: That costs too much. We only have 30,000 won together.',
        'Jun: Okay. He loves gardening, right? We could buy him some flower seeds.',
        'Sora: Good idea, but he already has lots of seeds. Last week he even gave some to our neighbor.',
        'Jun: Then what about new gloves? His are full of holes.',
        'Sora: Perfect! Good gardening gloves cost about 15,000 won.',
        'Jun: Then we can also buy a small cake with the rest of the money.',
        'Sora: Great. Let’s go to the shop together after school tomorrow.'
    ],[['gardening','정원 가꾸기'],['neighbor','이웃'],['holes','구멍']], [
        ['fact','How much money do Sora and Jun have together?','30,000 won.','15,000 won.','45,000 won.','50,000 won.','3번째 줄에서 둘이 합쳐 30,000원이 있다고 했습니다. 15,000원은 장갑 가격입니다.',[2]],
        ['main','What are Sora and Jun mainly talking about?','What to buy for Grandpa’s birthday.','How to grow flowers in a garden.','Why Grandpa’s phone is so slow.','Where to have a birthday party.','첫 줄에서 할아버지 생신 선물로 무엇을 살지 묻고, 휴대폰·씨앗·장갑을 차례로 따져 봅니다.',[0,1,3,5]],
        ['reference','What does “His” in line 6 refer to?','Grandpa’s gloves.','Jun’s gloves.','The neighbor’s gloves.','Grandpa’s seeds.','His는 ‘그의 것’, 즉 할아버지의 장갑(his gloves)을 줄인 말입니다. 새 장갑을 선물하자고 하면서 할아버지 장갑에 구멍이 났다고 말하는 것입니다. 이웃은 앞 줄에 나오지만 선물 받을 사람이 아닙니다.',[0,5]],
        ['vocabulary','What does “the rest of the money” in line 8 mean?','The money that is left over.','Money to use for a short break.','All of the money that they have.','Money that Grandpa gave them.','the rest of는 ‘~의 나머지’입니다. rest에는 ‘휴식’이라는 뜻도 있지만 여기서는 장갑을 사고 남은 돈을 뜻합니다.',[2,6,7]],
        ['inference','About how much money can they spend on the cake?','About 15,000 won.','About 30,000 won.','About 45,000 won.','About 5,000 won.','가진 돈 30,000원에서 장갑 약 15,000원을 빼면 약 15,000원이 남습니다. 30,000원 전부는 장갑값을 빼지 않은 금액입니다.',[2,6,7],'challenge'],
        ['inference','Why does Sora say no to the flower seeds?','Grandpa already has plenty of seeds.','Seeds cost more than 30,000 won.','Grandpa does not like gardening.','Their neighbor sells seeds cheaply.','5번째 줄에서 할아버지께 씨앗이 이미 많고 이웃에게 나눠 주기까지 했다고 합니다. 할아버지는 정원 가꾸기를 좋아하므로 세 번째 선택지는 틀립니다.',[4],'challenge'],
        ['evidence','Which two lines best explain why gloves are a good gift?','Lines 4 and 6.','Lines 2 and 3.','Lines 5 and 8.','Lines 1 and 9.','4번째 줄(할아버지가 정원 가꾸기를 좋아함)과 6번째 줄(장갑에 구멍이 남)이 장갑이 필요하고 쓸모 있다는 근거입니다. 2·3번째 줄은 휴대폰을 사지 않는 이유입니다.',[3,5],'challenge']
    ]);

    // 3주 2회 · 공지문
    add('middle1','j','New Recycling Rules',[
        'Starting next month, recycling day at Green Apartments will move from Monday to Wednesday.',
        'Please bring your recycling to the area behind Building 3 between 6 p.m. and 10 p.m.',
        'Paper boxes must be flattened and tied together.',
        'Plastic bottles should be empty and clean, and their labels should be removed.',
        'Glass bottles go in the green box, but broken glass must be wrapped in newspaper and put in the general trash.',
        'Large items like old chairs, desks, and beds are not collected on recycling day.',
        'To throw them away, call the management office and buy a special sticker.',
        'If we sort our waste carefully, more of it can be used again.',
        'Thank you for your help.'
    ],[['flattened','납작하게 펴진'],['wrapped','싸인'],['general trash','일반 쓰레기'],['management office','관리 사무소'],['sort','분류하다']], [
        ['fact','Where should people bring their recycling?','To the area behind Building 3.','To the management office.','To the front of Building 1.','To the green box at the school.','2번 문장에서 3동 뒤 공간으로 가져오라고 했습니다. 관리 사무소는 큰 물건을 버릴 때 전화하는 곳입니다.',[1]],
        ['main','What is the notice mainly about?','A new day and rules for recycling.','How to buy a new chair cheaply.','Why Building 3 is being repaired.','A newspaper that people can read.','재활용 요일 변경과 종이·플라스틱·유리·큰 물건 배출 규칙을 알리는 공지입니다.',[0,2,3,4,5]],
        ['reference','What does “them” in sentence 7 refer to?','Large items like old chairs.','Plastic bottles and labels.','Paper boxes tied together.','Special stickers from the office.','재활용 날 수거하지 않아 따로 스티커를 사서 버려야 하는 것은 6번 문장의 오래된 의자 같은 큰 물건입니다. 스티커는 버리는 대상이 아니라 사는 물건입니다.',[5,6]],
        ['vocabulary','What does “move” in sentence 1 mean?','Be changed to a different day.','Go to live in a new building.','Be carried away by a truck.','Become a longer and busier day.','move는 ‘이사하다, 옮기다’ 외에 ‘(날짜·시간을) 바꾸다’의 뜻도 있습니다. 재활용 날이 월요일에서 수요일로 바뀐다는 뜻입니다.',[0]],
        ['inference','A woman broke a glass cup. What should she do with it?','Wrap it in newspaper and put it in the general trash.','Put it in the green box with the glass bottles.','Tie it together with the flattened paper boxes.','Call the office and buy a special sticker for it.','깨진 유리는 신문지에 싸서 일반 쓰레기로 버려야 합니다. 초록 상자는 깨지지 않은 유리병용이므로 두 번째 선택지는 틀립니다.',[4],'challenge'],
        ['inference','Next month, Mr. Lee wants to bring boxes for recycling on Monday evening. What is the problem?','Recycling day will be Wednesday, not Monday.','Boxes cannot be recycled at Green Apartments.','He must buy a special sticker for every box.','The recycling area closes at 6 p.m. each day.','다음 달부터 재활용 날이 수요일로 바뀌므로 월요일에 내놓으면 안 됩니다. 수거 시간은 오후 6시부터 10시까지라 6시에 닫는 것이 아닙니다.',[0,1],'challenge'],
        ['evidence','Someone says, “I will put my old desk out with the recycling on Wednesday.” Which sentence shows that this is not right?','Sentence 6.','Sentence 1.','Sentence 2.','Sentence 8.','6번 문장에서 의자·책상·침대 같은 큰 물건은 재활용 날 수거하지 않는다고 했습니다. 그러므로 책상은 7번 문장처럼 스티커를 사서 버려야 합니다. 1번 문장은 수요일이 재활용 날이라는 내용일 뿐입니다.',[5,6],'challenge']
    ]);

    // 3주 3회 · 단체 메시지
    add('middle1','k','The Club Video Chat',[
        'Minji (7:10 p.m.): Hi, everyone! Our club video for the school festival is due this Friday.',
        'Tom (7:12 p.m.): I finished filming the interviews yesterday. They look great!',
        'Minji (7:13 p.m.): Nice! Yuna, can you add music to the video?',
        'Yuna (7:20 p.m.): Sure, but my laptop is being fixed until Thursday.',
        'Yuna (7:21 p.m.): Can someone lend me a laptop, or should I use the computer room?',
        'Tom (7:25 p.m.): The computer room is open after school until 5. You can use it on Wednesday.',
        'Minji (7:26 p.m.): Good. I will add the subtitles tonight, so the music will be the last step.',
        'Yuna (7:30 p.m.): Okay! I will send you the final file by Thursday night.'
    ],[['due','(제출) 마감인'],['filming','촬영하기'],['lend','빌려주다'],['subtitles','자막']], [
        ['fact','When is the club video due?','This Friday.','This Thursday.','This Wednesday.','Next Monday.','1번째 줄에서 이번 주 금요일이 마감이라고 했습니다. 목요일 밤은 유나가 파일을 보내기로 한 때입니다.',[0]],
        ['main','What is the chat mainly about?','Sharing the last jobs to finish a video.','Choosing a new leader for the club.','Buying a new laptop for Yuna.','Planning interviews for the festival.','마감을 앞두고 인터뷰(완료), 자막, 음악 작업을 누가 언제 할지 나누는 대화입니다. 인터뷰는 이미 어제 촬영을 마쳤습니다.',[0,1,2,6,7]],
        ['reference','What does “They” in line 2 refer to?','The interviews Tom filmed.','The club members in the chat.','The guests at the festival.','The music files for the video.','같은 줄 앞에서 Tom이 어제 촬영을 마친 인터뷰를 말하고 바로 “They look great!”라고 합니다.',[1]],
        ['vocabulary','What does “being fixed” in line 4 mean?','Being repaired.','Being sold.','Being tied down.','Being turned off.','fix에는 ‘고정하다’ 외에 ‘고치다’라는 뜻이 있습니다. 노트북을 목요일까지 쓸 수 없어 다른 노트북이나 컴퓨터실을 찾으므로 수리 중이라는 뜻입니다.',[3,4]],
        ['inference','Which order of work fits the chat?','Interviews, then subtitles, then music.','Music, then interviews, then subtitles.','Subtitles, then music, then interviews.','Interviews, then music, then subtitles.','인터뷰는 어제 끝났고(2번째 줄), 민지가 오늘 밤 자막을 넣으며 음악이 마지막 단계라고 했습니다(7번째 줄).',[1,6],'challenge'],
        ['inference','What does Minji mean by “the music will be the last step”?','Adding music will finish the video.','Music should be added before subtitles.','Music is the least important part.','Yuna should stop working on the music.','자막을 먼저 넣고 음악을 넣으면 영상이 완성된다는 뜻입니다. last step은 ‘마지막 단계’이지 ‘가장 덜 중요한 부분’이 아닙니다.',[6],'challenge'],
        ['evidence','Which line shows that Yuna has a problem doing her part?','Line 4.','Line 2.','Line 6.','Line 8.','4번째 줄에서 노트북이 목요일까지 수리 중이라 음악 작업에 문제가 생겼음을 말합니다. 6번째 줄은 그 문제에 대한 해결책입니다.',[3],'challenge']
    ]);

    // 4주 1회 · 짧은 이야기
    add('middle1','l','The Seat by the Window',[
        'Leo moved to Korea from Canada in April, and he joined our class on a Monday.',
        'He could speak a little Korean, but he was very quiet for the first few days.',
        'At lunch, he always sat alone by the window and read a comic book.',
        'One day, I saw a badminton racket in his bag.',
        'Our class was going to play badminton in P.E. that Friday, so I asked him to practice with us.',
        'He looked surprised, but then he smiled and said, “Sure!”',
        'It turned out that he was the best player in our class.',
        'Now he teaches us how to hit the shuttlecock, and we help him with Korean words.',
        'These days, the seat by the window is often empty at lunch.'
    ],[['racket','라켓'],['P.E.','체육 시간'],['shuttlecock','(배드민턴) 셔틀콕']], [
        ['fact','What did the writer see in Leo’s bag?','A badminton racket.','A comic book.','A Korean textbook.','A tennis ball.','4번 문장에서 가방 속 배드민턴 라켓을 보았습니다. 만화책은 Leo가 점심시간에 읽던 것입니다.',[3]],
        ['main','What is the story mainly about?','How a sport helped a new student make friends.','Why Leo moved from Canada to Korea.','How to win a badminton game in P.E.','Why the writer likes comic books.','혼자 지내던 전학생이 배드민턴을 계기로 반 친구들과 서로 가르쳐 주는 사이가 되는 이야기입니다.',[2,4,7,8]],
        ['reference','Who does “us” in sentence 8 refer to?','The writer and the classmates.','Leo and his family.','The P.E. teachers.','Students in Canada.','Leo가 셔틀콕 치는 법을 가르쳐 주는 대상은 글쓴이(I)를 포함한 우리 반 친구들입니다. 5번 문장의 practice with us와 같은 사람들입니다.',[4,7]],
        ['vocabulary','What does “turned out” in sentence 7 mean?','Was found to be true.','Turned the lights off.','Moved in a circle.','Went outside quickly.','It turned out that ~은 ‘~라는 것이 드러났다(알고 보니 ~였다)’라는 뜻입니다. turn이 ‘돌다’라는 뜻이라고 해서 원을 그리며 움직인다는 뜻이 아닙니다.',[6]],
        ['inference','What does sentence 9 suggest?','Leo no longer eats lunch alone.','Leo has moved back to Canada.','The window seat is broken now.','Leo has stopped coming to school.','예전에는 Leo가 창가 자리에 혼자 앉았는데(3번), 이제 그 자리가 자주 비어 있습니다. 8번 문장에서 Leo는 지금도 친구들을 가르치고 있으므로 캐나다로 돌아갔다는 것은 틀립니다.',[2,7,8],'challenge'],
        ['inference','Why did the writer ask Leo to practice badminton?','Leo seemed to like badminton, and a game was coming.','The teacher told the writer to help Leo with Korean.','Leo asked the writer to join the class team first.','The writer needed to borrow a racket from Leo.','가방 속 라켓을 보고(4번) 그 주 금요일 체육 시간에 배드민턴을 하기로 되어 있었기 때문에(5번) 함께 연습하자고 했습니다.',[3,4],'challenge'],
        ['evidence','Which detail shows that Leo and his classmates now help each other?','He teaches badminton, and they teach him Korean.','He smiled and said “Sure!” to the writer.','He sat alone by the window at lunch.','He was the best player in the class.','8번 문장에서 Leo는 배드민턴을, 친구들은 한국어를 서로 가르쳐 줍니다. 최고의 선수라는 것은 실력에 관한 사실일 뿐 서로 돕는다는 근거가 아닙니다.',[7],'challenge']
    ]);

    // 4주 2회 · 설명문
    add('middle1','m','What Is Inside a Camel’s Hump?',[
        'Many people believe that a camel stores water in its hump.',
        'In fact, a camel’s hump is mostly fat.',
        'When food is hard to find, the camel’s body can use this fat for energy.',
        'If a camel goes without food for a long time, its hump can become smaller and even fall to one side.',
        'So how do camels live in hot, dry deserts?',
        'They can drink a lot of water very quickly, about 100 liters in a short time.',
        'Their bodies also lose water slowly, so they do not need to drink often.',
        'Because of these abilities, camels have helped people travel across deserts for thousands of years.'
    ],[['hump','(낙타의) 혹'],['desert','사막'],['abilities','능력(ability의 복수)']], [
        ['fact','What is a camel’s hump mostly made of?','Mostly fat.','Mostly water.','Mostly air.','Mostly muscle.','2번 문장 In fact 뒤에서 혹은 대부분 지방이라고 바로잡습니다. 물이라는 것은 1번 문장의 잘못된 믿음입니다.',[0,1]],
        ['main','What is the main purpose of the passage?','To correct a wrong belief about camels.','To explain how to ride a camel safely.','To compare camels with desert birds.','To show where most camels live today.','많은 사람의 믿음(혹에 물 저장)을 In fact로 바로잡고, 낙타가 사막에서 사는 실제 방법을 설명합니다.',[0,1,5,6]],
        ['reference','What does “They” in sentence 6 refer to?','Camels.','Deserts.','Humps.','People.','바로 앞 5번 문장 how do camels live ~?의 camels를 가리킵니다. 물을 빨리 마실 수 있는 것은 사막이 아니라 낙타입니다.',[4,5]],
        ['vocabulary','What does “stores” in sentence 1 mean?','Keeps something to use later.','Shops that sell many things.','Loses something very quickly.','Carries something to a shop.','store는 명사로 ‘가게’지만 여기서는 동사로 ‘저장하다, 보관하다’입니다. 물을 혹에 넣어 두었다가 쓴다는 믿음을 말합니다.',[0]],
        ['inference','A camel has not eaten for many days. What will probably happen to its hump?','It will get smaller as the fat is used.','It will get bigger as water is stored.','It will stay the same size as before.','It will quickly fill with water again.','먹이가 없으면 몸이 혹의 지방을 에너지로 쓰고(3번), 오래 굶으면 혹이 작아집니다(4번).',[2,3],'challenge'],
        ['inference','Why does the writer ask the question in sentence 5?','To start explaining how camels handle dry places.','To show that camels cannot live in deserts.','To ask readers to visit a hot desert.','To repeat the wrong belief in sentence 1.','혹이 물 저장고가 아니라면 낙타가 어떻게 사막에서 사는지 궁금해지므로, 질문을 던진 뒤 6·7번 문장에서 물을 빨리 마시고 천천히 잃는다는 답을 설명합니다.',[4,5,6],'challenge'],
        ['evidence','Which two abilities help camels live with little water?','Drinking water quickly and losing water slowly.','Storing water in the hump and drinking often.','Using fat as water and sleeping all day.','Eating a lot of food and running very fast.','6번(많은 물을 빠르게 마심)과 7번(물을 천천히 잃음) 문장이 근거입니다. 혹에 물을 저장한다는 것은 글이 바로잡은 잘못된 믿음이고, 자주 마실 필요가 없다고 했습니다.',[5,6],'challenge']
    ]);

    // 4주 3회 · 조사 결과(도표를 글로 설명)
    add('middle1','n','How Do We Get to School?',[
        'Our class did a survey of 30 students about how they get to school.',
        'Walking was the most common way: 12 students walk to school.',
        'Eight students take the bus, and six students ride their bikes.',
        'The other students come by car with their parents.',
        'We also asked how long it takes to get to school.',
        'Most walkers need less than 15 minutes, but most bus riders need more than 20 minutes.',
        'Many bike riders said they want a safer bike path near the school gate.',
        'We will share these results with the student council next week.'
    ],[['survey','설문 조사'],['common','흔한'],['path','길'],['student council','학생회']], [
        ['fact','How many students take the bus?','Eight.','Six.','Twelve.','Four.','3번 문장에서 8명이 버스를 탄다고 했습니다. 6명은 자전거를 타는 학생 수입니다.',[2]],
        ['main','What is the passage mainly about?','The results of a class survey about getting to school.','Why walking is better than taking the bus.','How to build a safe bike path near a school.','The rules for riding bikes to school safely.','통학 방법과 걸리는 시간에 대한 학급 설문 결과를 정리한 글입니다. 걷기가 더 좋다는 의견은 글에 나오지 않습니다.',[0,1,2,4,5]],
        ['reference','Who does “they” in sentence 7 refer to?','Many bike riders.','The bus riders.','The walkers.','The student council.','더 안전한 자전거 길을 원한다고 말한 사람은 같은 문장 앞의 Many bike riders입니다.',[6]],
        ['vocabulary','What does “takes” in sentence 5 mean?','Needs an amount of time.','Gets on a bus or train.','Holds something in a hand.','Carries something away.','how long it takes는 ‘시간이 얼마나 걸리는가’로, take가 ‘(시간이) 걸리다’라는 뜻입니다. 3번 문장의 take the bus(버스를 타다)와 뜻이 다릅니다.',[4,5]],
        ['inference','How many students come to school by car?','Four.','Six.','Eight.','Ten.','전체 30명에서 걷는 12명, 버스 8명, 자전거 6명을 빼면 30−12−8−6=4명입니다.',[0,1,2,3],'challenge'],
        ['inference','What will the class most likely ask the student council for?','A safer bike path near the school gate.','More buses for students who walk.','A shorter school day for walkers.','A new parking lot for parents.','결과를 학생회에 전하겠다고 했고(8번), 설문에서 나온 요청은 학교 정문 근처의 더 안전한 자전거 길입니다(7번). 다른 선택지는 설문에서 아무도 요청하지 않았습니다.',[6,7],'challenge'],
        ['evidence','Minsu says, “Taking the bus is the fastest way to get to school.” Which sentence makes this hard to believe?','Sentence 6.','Sentence 2.','Sentence 3.','Sentence 7.','6번 문장에서 대부분의 버스 이용 학생은 20분 넘게 걸리고 걷는 학생은 대부분 15분이 안 걸린다고 했습니다. 3번 문장은 버스 이용 인원만 알려 줍니다.',[5],'challenge']
    ]);
})(typeof window !== 'undefined' ? window : globalThis);
