(function (root) {
    'use strict';
    // Independently authored exam-only texts. No daily passage or answer is reused.
    // Reading-skill transfer at the evidenced grade, not certification of every grammar prerequisite. Essential unfamiliar phrases are glossed.
    const passages = [];
    function add(gradeId, variant, title, lines, glossary, rows) {
        const id = `mock-en-${gradeId}-${variant}`;
        passages.push({ id, gradeId, title, lines, glossary: glossary.map(([word,meaning]) => ({word,meaning})), grammarProfile: 'grade-aligned-reading',
            questions: rows.map((row,index) => {
                const [skill,question,answer,a,b,c,explanation,evidenceLines,difficulty='standard'] = row;
                const choices = [answer,a,b,c];
                const shift = (index + gradeId.length + variant.charCodeAt(0)) % 4;
                return {id:`${id}-q${index+1}`,skill,question,answer,choices:choices.slice(shift).concat(choices.slice(0,shift)),explanation,evidenceLines,difficulty,cognitiveDemand:difficulty==='challenge'?'reasoning':'application'};
            }) });
    }

    add('grade6','a','The Rainy-Day Box',[
        'Mina puts a box of paper games beside the classroom door on Monday.',
        'Students can use the games inside when it rains, but they must put them back before going home.',
        'On Tuesday, it is sunny, so Mina leaves the box closed and plays outside.',
        'On Wednesday, rain starts after lunch, and three students open the box.',
        'One game has a missing card, so they choose another game and leave a note about the card.',
        'Before going home, they return all the pieces of the game they used.',
        'Mina reads their note and brings a new card the next morning.'
    ],[['piece','게임 도구의 낱개'],['missing','없어진']], [
        ['fact','When do three students open the box?','On Wednesday after lunch.','On Monday before class.','On Tuesday after lunch.','On Thursday before class.','비가 수요일 점심 뒤 시작되고 세 학생이 상자를 엽니다.',[3]],
        ['main','What is the passage mainly about?','Sharing games and caring for them.','Choosing the best outdoor game.','Making new classroom doors.','Finding a place to eat lunch.','함께 쓰는 게임을 이용하고 문제를 기록하며 돌보는 이야기입니다.',[1,4,5,6]],
        ['reference','What does “them” in sentence 2 refer to?','The games.','The students.','The doors.','The notes.','돌려놓아야 하는 대상은 앞에 나온 games입니다.',[0,1]],
        ['vocabulary','What does “return” in sentence 6 mean?','Put something back.','Use something first.','Make something bigger.','Write something down.','게임 도구를 사용한 뒤 제자리에 돌려놓는 상황입니다.',[1,5]],
        ['inference','It rains on Friday. A group wants a box game. What follows the rule?','Use it inside and put it back before going home.','Use it outside and put it back before lunch.','Use it inside and take it home for the night.','Use it outside and leave it beside a tree.','비가 오는 날 실내에서 쓰기와 귀가 전 반납이라는 두 조건을 모두 지켜야 합니다.',[1],'challenge'],
        ['inference','Why is the note useful to Mina?','It tells her what the game needs.','It tells her when lunch starts.','It asks her to close the classroom.','It asks her to move games outside.','없어진 카드에 관한 쪽지를 읽은 뒤 새 카드를 가져오므로 수리에 필요한 정보를 줍니다.',[4,6],'challenge'],
        ['evidence','Which pair of actions shows both reporting a problem and caring for shared things?','Leaving the card note and returning the used pieces.','Opening the box and watching the rain outside.','Playing outside and keeping the box closed.','Bringing a card and waiting until after lunch.','문제를 쪽지로 알리는 행동과 사용한 도구를 반납하는 행동을 함께 골라야 합니다.',[4,5],'challenge']
    ]);

    add('grade6','b','A Place for the Seed',[
        'Jun wants to grow a bean plant for his class.',
        'His teacher says, “Give it water and light, and write down what you see.”',
        'Jun puts two cups by the window and puts one bean in each cup.',
        'He gives both beans the same amount of water every morning.',
        'A thick book stands in front of one cup, so little light reaches it.',
        'After a week, the plant behind the book is pale, but the other plant is green.',
        'Jun moves the book and keeps a record for another week.',
        'He does not say the beans are different kinds: both beans are the same kind.'
    ],[['pale','색이 옅은'],['record','관찰 기록']], [
        ['fact','What does Jun give both beans every morning?','The same amount of water.','A new cup of soil.','A different kind of bean.','A thick book to stand on.','매일 아침 두 콩에 같은 양의 물을 줍니다.',[3]],
        ['main','Which title best matches Jun’s work?','Watching How Light Reaches a Plant.','Choosing the Biggest Bag of Beans.','Reading a Book beside a Window.','Moving a Class to a New Room.','빛이 적게 닿는 식물의 상태를 보고 빛을 가린 책을 옮기는 관찰입니다.',[4,5,6]],
        ['reference','What does “it” in sentence 5 refer to?','One cup.','The window.','The thick book.','The whole class.','책 앞의 one cup에 빛이 거의 도달하지 않는다는 뜻입니다.',[4]],
        ['vocabulary','What does “reaches” in sentence 5 mean?','Gets to.','Runs from.','Writes about.','Grows under.','빛이 컵에 도달한다는 의미입니다.',[4]],
        ['inference','Which change gives the pale plant more light without changing its water?','Move the book and keep watering as before.','Keep the book there and add more water.','Move both cups into a closed cupboard.','Give the green plant less water each day.','빛을 막는 책을 옮기고 기존 물주기를 유지하면 제시된 두 조건을 충족합니다.',[3,4,6],'challenge'],
        ['inference','Why can Jun not explain the colors by saying he used two kinds of beans?','Both beans are explicitly the same kind.','The two cups stand on a book.','The teacher chose the greener plant.','The plants receive no water at all.','마지막 문장에 두 콩이 같은 종류라고 명시되어 있어 종류 차이로 설명할 수 없습니다.',[7],'standard'],
        ['evidence','Which two facts make light a reasonable thing for Jun to check next?','Equal water, but less light for the pale plant.','Equal light, but more water for the green plant.','Different beans, but two cups by one window.','Different water, but a book in front of both cups.','물은 같고 빛을 받는 조건이 다르므로 다음에 빛의 영향을 살펴볼 근거가 됩니다. 원인을 확정한 것은 아닙니다.',[3,4,5],'challenge']
    ]);

    add('middle1','a','The Shorter Queue',[
        'At lunchtime, students often wait in a long line to borrow sports equipment.',
        'The sports club tries a new plan on Tuesday: students write their names and the items they want before lunch.',
        'A club member then puts the requested items on a table near the gym.',
        'The line moves faster that day, but several students ask for balls without writing their names first.',
        'The club first gives students the prepared items. Then it gives these students the returned items.',
        'The club also notices that Tuesday has fewer borrowers than Monday because one class is away on a trip.',
        'For the next test, the club will compare two days with similar numbers of borrowers.',
        'It will record both waiting time and the number of students who receive the item they want.'
    ],[['equipment','운동 용품'],['borrower','빌리는 사람'],['requested','요청한']], [
        ['fact','When do students write their requests in the new plan?','Before lunch.','After playing outside.','During the school trip.','After the table is empty.','새 방식에서는 점심 전에 이름과 원하는 물품을 적습니다.',[1]],
        ['main','What is the club mainly trying to do?','Improve borrowing and check whether its plan helps.','Choose a new destination for the school trip.','Replace all sports equipment with new items.','Teach a class how to play a different sport.','대여 절차를 개선하고 이용자 수와 대기 시간 등을 기록하여 효과를 확인하려 합니다.',[0,1,6,7]],
        ['reference','What does “these students” in sentence 5 refer to?','Students who did not write their names first.','Students who prepared the items on the table.','Students who left school for the class trip.','Students who borrowed equipment on Monday.','바로 앞 문장의 사전 신청을 하지 않은 학생들을 가리킵니다.',[3,4]],
        ['vocabulary','What does “similar” in sentence 7 mean?','Close to the same.','Larger every time.','Written in advance.','Missing from a list.','신청자 수가 비슷한 두 날을 비교하겠다는 의미입니다.',[5,6]],
        ['inference','Why does the faster Tuesday line not yet prove that the new plan works?','Fewer borrowers may also have reduced waiting.','The club did not put requested items on the table.','Every student was away on a school trip that day.','The old plan measured how well students played.','새 방식 외에도 이용자 수가 적었다는 차이가 있어 대기 감소 원인을 단정할 수 없습니다.',[3,5],'challenge'],
        ['inference','Which pair of days best fits the club’s next comparison?','An old-plan day with 40 borrowers and a new-plan day with 42.','An old-plan day with 20 borrowers and a new-plan day with 80.','Two trip days with no students borrowing any equipment.','Two new-plan days with different lists of school trips.','서로 비슷한 이용자 수에서 기존 방식과 새 방식을 비교해야 계획의 영향을 보기 좋습니다.',[5,6],'challenge'],
        ['evidence','The new plan shortens waiting, but many students get the wrong item. Which recorded measure reveals that problem?','How many students receive the item they want.','How many classes leave for trips on Monday.','How many club members bring their lunches.','How many names are written before the test.','대기 시간만으로는 원하는 물품을 받았는지 알 수 없어 두 번째 지표가 필요합니다.',[7],'challenge']
    ]);

    add('middle1','b','The Notice on the Gate',[
        'A small community garden opens to visitors on Saturday mornings.',
        'The gate notice says that visitors may pick leaves from plants with blue labels, but must leave plants with yellow labels untouched.',
        'Each family may take one small bag of blue-label leaves.',
        'Aya arrives with her brother and their father, and they bring three bags.',
        'Her brother thinks the rule gives each person one bag, but Aya reads the notice again.',
        'They fill just one bag and ask a helper about a plant with no label.',
        'The helper says its label fell off and checks the garden map before answering.',
        'Aya waits instead of guessing from the color of the leaves.',
        'The helper finds that the plant is for next month’s seeds, so the family leaves it alone.'
    ],[['label','표지'],['untouched','손대지 않은 상태로'],['seed','씨앗']], [
        ['fact','Which plants may visitors pick leaves from?','Plants with blue labels.','Plants with yellow labels.','Plants with the tallest stems.','Plants nearest to the garden gate.','파란 표지가 있는 식물만 잎을 딸 수 있습니다.',[1]],
        ['main','Which idea best connects Aya’s two decisions?','Check the rule or ask before taking something.','Bring more bags when visiting with a family.','Choose plants by the color of their leaves.','Finish picking before the helper arrives.','가족당 수량을 다시 읽고, 표지가 없을 때는 도움을 구해 확인합니다.',[4,5,6,7]],
        ['reference','What does “its” in sentence 7 refer to?','The plant with no label.','The bag filled with leaves.','The map used by the helper.','The notice on the gate.','떨어진 표지는 앞서 질문한 무표지 식물의 표지입니다.',[5,6]],
        ['vocabulary','What does “leaves it alone” in the last sentence mean?','Does not pick or disturb the plant.','Carries the plant away in one bag.','Puts the plant beside another gate.','Asks the plant’s name once more.','씨앗을 위한 식물이므로 건드리거나 잎을 따지 않고 그대로 둡니다.',[8]],
        ['inference','Two parents and two children visit together as one family. What can they take?','One small bag from blue-label plants.','Four small bags from blue-label plants.','One small bag from yellow-label plants.','Two small bags from plants without labels.','가족당 한 봉지와 파란 표지 식물이라는 조건을 동시에 적용합니다.',[1,2],'challenge'],
        ['inference','A plant has green leaves but no label. What should a new visitor do?','Ask the helper to check its status.','Pick it because most leaves are green.','Treat it as blue-label because its label is absent.','Take one leaf because the bag is still empty.','잎 색이나 표지 부재만으로 허용 여부를 알 수 없으며 확인해야 합니다.',[5,6,7,8],'challenge'],
        ['evidence','Why does bringing three bags not let Aya’s group take three bags of leaves?','The limit applies to the family, not the number of bags.','The notice counts only people who can read it.','The garden has only three blue-label plants.','The helper gives bags only to the youngest child.','가져온 봉지 수가 아니라 가족 단위로 허용량을 정합니다.',[2,3,4,5],'challenge']
    ]);

    add('middle2','a','A Cooler Waiting Place',[
        'A neighborhood group wants to improve a bus stop that becomes hot in the afternoon.',
        'Members compare two possible changes: a small roof that blocks sunlight and a board showing the next bus time.',
        'They ask thirty people at the stop which change they prefer, and twenty choose the roof.',
        'However, the survey takes place on a very hot day, between two and four in the afternoon.',
        'People using the stop early in the morning are not included.',
        'The group also learns that a roof needs permission because the pavement must remain wide enough for wheelchairs.',
        'A bus-time board is easier to install, but it does not protect anyone from the sun.',
        'Instead of choosing immediately, the group measures the pavement and repeats the survey in the morning.',
        'Members agree to consider comfort, access, and the needs of different users together.',
        'They will publish the survey times with their results so readers can judge whom the answers represent.'
    ],[['pavement','보도'],['wheelchair','휠체어'],['access','이동하거나 이용할 수 있는 여건']], [
        ['fact','How many of the thirty afternoon respondents prefer the roof?','Twenty.','Ten.','Thirty.','Forty.','오후 조사 응답자 30명 중 20명이 지붕을 선택했습니다.',[2]],
        ['main','What is the main purpose of the group’s next steps?','Make a decision using broader views and practical limits.','Show that bus-time boards cannot provide useful information.','Prove that afternoon visitors use the stop more often.','Install the most popular choice before measuring anything.','이용자 범위를 넓혀 조사하고 보도 폭이라는 실제 조건도 확인합니다.',[4,5,7,8]],
        ['reference','What does “their results” in sentence 10 refer to?','The group’s survey findings.','The wheelchair users’ travel plans.','The bus drivers’ daily records.','The roof builders’ price estimates.','그룹이 조사한 결과와 조사 시간을 함께 공개한다는 뜻입니다.',[2,7,9]],
        ['vocabulary','What does “represent” in the last sentence mean?','Reflect the views of.','Offer protection to.','Create a place for.','Give permission to.','답변이 누구의 의견을 반영하는지를 판단한다는 문맥입니다.',[9]],
        ['inference','Morning users mostly prefer the board. What is the most careful response?','Report both groups and consider their different needs.','Replace the afternoon answers with the morning ones.','Count only the larger group without reporting survey times.','Treat morning preferences as proof that a roof gives no shade.','시간대에 따른 요구 차이를 드러내고 함께 검토해야 하며 한 조사만 지우는 것은 타당하지 않습니다.',[3,4,7,8,9],'challenge'],
        ['inference','A roof design leaves too little wheelchair space. What follows from the passage?','Its popularity alone is not enough to approve that design.','The survey must have recorded the wrong number of people.','The board will provide the same protection from sunlight.','Morning users will necessarily prefer a different roof.','선호도 외에도 접근성과 설치 허가 조건을 충족해야 합니다.',[5,6,8],'challenge'],
        ['evidence','Why publish the survey times rather than just “20 out of 30”?','The times help readers understand which users were included.','The times show the exact cost of installing either change.','The times prove that wheelchairs fit beneath the roof.','The times predict when the next bus reaches the stop.','더운 날 오후의 응답만으로 모든 이용자의 의견을 대표한다고 할 수 없기 때문입니다.',[2,3,4,9],'challenge']
    ]);

    add('middle2','b','The Repair Table',[
        'A school club opens a repair table for broken pencil cases, bags, and simple toys.',
        'At first, its poster says, “Bring anything broken,” and students arrive with many different objects.',
        'Some have only a loose button. Students can replace that button, but they cannot safely repair the electric parts in other toys.',
        'The members realize that a welcoming message can create expectations beyond their skills.',
        'They change the poster to list the objects they can accept and ask visitors to describe the problem in advance.',
        'They also keep a record of items that leave the table working and items that need professional help.',
        'In the first week, twelve objects work again, but four of them break within two days.',
        'The club therefore adds a follow-up question one week after each repair.',
        'A member suggests counting every visitor as a success because the event encourages conversation.',
        'The club values that benefit, but decides to report conversations separately from repairs that last.',
        'Its goal is not simply to produce a large number; it wants students to understand what the table can genuinely offer.'
    ],[['professional','전문가의'],['follow-up','후속 확인'],['expectation','기대']], [
        ['fact','Why are some objects unsuitable for the table?','Their electric parts cannot be safely repaired by the club.','Their owners forget to bring a pencil case with them.','The club accepts only objects bought during that week.','The new poster refuses objects with loose buttons.','전기 부품이 있는 일부 물건은 동아리가 안전하게 수리할 수 없습니다.',[2]],
        ['main','What is the club learning to do?','State its limits and measure lasting results honestly.','Accept more objects by making the poster less specific.','Replace repair work with conversations about school.','Count early results without checking what happens later.','수리 범위를 명확히 하고 일주일 뒤 유지 여부를 확인하며 성과를 구별합니다.',[4,7,9,10]],
        ['reference','What does “that benefit” in sentence 10 refer to?','Encouraging conversation.','Replacing electric parts.','Finishing twelve lasting repairs.','Describing a problem in advance.','바로 앞 문장에 나온 대화를 장려하는 이점을 가리킵니다.',[8,9]],
        ['vocabulary','What does “last” in sentence 10 mean?','Continue to work over time.','Arrive later than visitors.','Cost more than other repairs.','Remain at the repair table.','고친 뒤에도 작동 상태가 유지되는 수리를 뜻합니다.',[6,7,9]],
        ['inference','Why is “twelve successful repairs” an incomplete description of the first week?','Four worked at first but stopped working soon afterward.','Four visitors never brought objects to the table.','Twelve objects contained unsafe electric parts.','Twelve visitors wanted conversations instead of repairs.','처음 작동한 12개 중 4개가 이틀 안에 다시 고장 났다는 정보를 함께 봐야 합니다.',[6,7],'standard'],
        ['inference','A visitor brings a radio with damaged wires. Which response fits the revised approach?','Explain the safety limit and suggest professional help.','Accept it because the first poster said anything broken.','Count it as a lasting repair after a friendly conversation.','Fix it quickly before asking what the problem is.','동아리의 안전 범위와 전문가 도움이 필요한 물건의 구별에 맞는 대응입니다.',[2,4,5],'challenge'],
        ['evidence','Which report best follows the club’s reporting decision?','List lasting repairs and conversations as different outcomes.','Add conversations to the repair total without a separate label.','Report only the number of visitors who enjoyed the event.','Use the first-day working total as the one-week result.','대화의 가치도 인정하지만 오래가는 수리와 별도 항목으로 보고하기로 했습니다.',[7,8,9],'challenge']
    ]);

    add('middle3','a','The Quiet Hour Experiment',[
        'A town library introduces a quiet hour from four to five every weekday, when group discussions must move to a room downstairs.',
        'The rule aims to help readers who need silence without removing space for collaborative work.',
        'After two weeks, staff receive fewer noise complaints, and a survey near the entrance shows that most respondents like the change.',
        'The library director is pleased but asks whether these results tell the whole story.',
        'A student explains that the downstairs room has stairs but no lift, so her friend cannot reach it in a wheelchair.',
        'Another reader says she now leaves before four because she needs to discuss homework with her younger brother.',
        'Neither person appears in the entrance survey taken at half past four.',
        'Staff decide to interview people at different times and contact some former afternoon users.',
        'They also test a ground-floor discussion area separated from the reading desks by sound-reducing panels.',
        'The director keeps the quiet hour during the test, but says that fewer complaints do not automatically mean that everyone’s needs are met.',
        'The next report will include both noise levels and whether different groups can still use the services they need.'
    ],[['collaborative','함께 협력하는'],['lift','승강기'],['sound-reducing panel','소음을 줄이는 칸막이']], [
        ['fact','What is the original purpose of the quiet hour?','Support silent reading while keeping room for group work.','End group work throughout the library every afternoon.','Move all readers to a downstairs reading room.','Allow discussions only during the weekend opening hours.','조용히 읽는 사람과 협력 활동을 하는 사람의 공간을 함께 보장하려는 목적입니다.',[0,1]],
        ['main','Which statement best expresses the passage’s main idea?','An apparent improvement needs checking for people it may exclude.','The most satisfied group should decide every library rule.','Library surveys are useful only before a new rule begins.','A quiet building has already solved its users’ access problems.','민원 감소 뒤에 이용을 포기하거나 접근하지 못하는 사람의 필요가 가려졌는지 확인합니다.',[4,5,6,9,10]],
        ['reference','What does “these results” in sentence 4 refer to?','Fewer complaints and favorable entrance-survey answers.','The downstairs stairs and the absence of a lift.','Interviews with former users at different times.','Noise readings from the new ground-floor area.','직전 문장에서 제시한 민원 감소와 설문 호응을 가리킵니다.',[2,3]],
        ['vocabulary','What does “former” in sentence 8 mean?','Previous.','Regularly paid.','Recently invited.','Physically nearby.','지금은 그 시간에 오지 않는 과거 오후 이용자를 뜻합니다.',[5,7]],
        ['inference','Why might the half-past-four survey overstate approval?','People discouraged by the rule may no longer be present then.','Staff ask people before the quiet hour starts that day.','Respondents must first use both discussion rooms.','The survey includes only people who filed complaints.','4시 전에 떠나는 사람과 접근에 어려움이 있는 사람은 4시 30분 설문에서 빠집니다.',[4,5,6],'challenge'],
        ['inference','Noise remains low, but wheelchair users still cannot join discussions. What conclusion fits the director’s position?','One goal is being met while an access problem remains.','Both goals have been achieved because complaints fell.','The survey proves that group work is no longer needed.','The noise measure must be wrong because access is limited.','조용함과 서비스 접근은 별개 지표이므로 한 목표의 성공이 다른 목표의 성공을 보장하지 않습니다.',[1,4,9,10],'challenge'],
        ['evidence','Which new evidence most directly tests whether the ground-floor alternative serves both aims?','Noise levels and participation by wheelchair users.','The total number of panels bought for the ground floor.','The number of favorable answers collected at half past four.','The director’s opinion about how the panels look from outside.','소음을 줄이는지와 계단을 이용하지 못하던 사람이 참여하는지를 함께 봐야 합니다.',[1,4,8,10],'challenge']
    ]);

    add('middle3','b','A Map That Learns',[
        'Students create an online map of drinking-water stations around their town.',
        'They first place a blue symbol wherever a station is listed in an old council document.',
        'During a weekend walk, however, they find that one listed station is no longer there and another works only when a nearby building is open.',
        'The group changes the map so that each symbol includes the date of the latest check and any limits on access.',
        'A gray symbol means “not recently checked,” rather than “no water available.”',
        'Visitors can send updates, but the students do not change a station’s status from a single message with no date or location.',
        'Instead, they request details and ask another member to check when possible.',
        'One student worries that showing uncertainty will make the map look unreliable.',
        'The others reply that hiding uncertainty may make a clear-looking map less useful to someone planning a walk.',
        'They add a short guide explaining what the colors mean and advise walkers to carry water on routes with unconfirmed stations.',
        'The map does not promise a perfect picture of the town; it helps users make a decision with information about what is known and what still needs checking.'
    ],[['council','지방 자치 기관'],['status','현재 상태'],['unconfirmed','확인되지 않은']], [
        ['fact','What does a gray symbol mean?','The station has not been checked recently.','The station has been removed from the town.','The station supplies water throughout the day.','The station is inside a building that is now open.','회색은 최근 확인하지 않았음을 뜻하며 물이 없다는 뜻은 아닙니다.',[4]],
        ['main','What is the main purpose of the revised map?','Help users assess information and its limits.','Replace local walks with reports from old documents.','Make every station appear equally easy to access.','Remove uncertain stations so the map looks simpler.','확인 날짜와 접근 제한 및 미확인 상태를 알려 판단을 돕습니다.',[3,4,9,10]],
        ['reference','What does “they” in sentence 7 refer to?','The students maintaining the map.','The visitors planning a weekend walk.','The members of the local council.','The people opening nearby buildings.','추가 정보를 요청하고 다른 구성원에게 확인을 부탁하는 주체는 지도를 관리하는 학생들입니다.',[5,6]],
        ['vocabulary','What does “limits” in sentence 4 mean?','Limits on using a station.','Distances between all the blue symbols on a screen.','Dates on which students first joined the map group.','Promises that each water station will remain open.','건물이 열릴 때만 쓸 수 있는 경우처럼 이용을 제약하는 조건입니다.',[2,3]],
        ['inference','A route has two gray stations. What does the guide support?','Carry water because availability has not been confirmed.','Carry no water because gray guarantees working stations.','Avoid the route because gray proves both stations are gone.','Treat the older council list as a more recent check.','미확인은 이용 가능이나 불가능의 확정이 아니므로 안내대로 물을 챙기는 것이 타당합니다.',[4,9],'challenge'],
        ['inference','A message says “The station is broken” but gives no place or date. What should happen next?','Seek details before changing a station’s status.','Change every station on that route to “removed.”','Reject future updates from all visitors to the town.','Mark the oldest station as broken because it is most likely.','위치와 날짜가 없는 단일 제보만으로 상태를 바꾸지 않고 세부 정보를 요청합니다.',[5,6],'challenge'],
        ['evidence','Which case best supports the students’ reason for showing access limits?','It warns walkers about access to indoor stations.','A map can keep its original colors without adding a guide.','A station’s blue symbol can replace the need for a location.','An undated message can confirm every station in a district.','건물 개방 시간 제한을 알면 실제 이용 가능성을 고려한 계획을 세울 수 있습니다.',[2,3,8,10],'challenge']
    ]);
    add('high1','a','Shade for Whom?',[
        'When a city plants trees to make summer streets more comfortable, counting the new trees seems a straightforward way to report progress.',
        'Yet the count does not show where the shade falls, when people need it, or whether the trees survive long enough to provide it.',
        'In one district, residents propose planting along a wide road where almost nobody walks, because planting there would be inexpensive.',
        'A youth group instead maps the routes people use to reach a clinic, a school, and a bus stop.',
        'Its volunteers walk these routes in the morning and afternoon, noting existing shade and places where pedestrians must wait.',
        'They discover that a small shelter at one busy crossing could provide immediate relief while young trees nearby are still growing.',
        'The group does not argue that shelters should replace trees: trees offer other benefits and can provide more shade as they mature.',
        'It suggests reporting both the number of surviving trees and the amount of shade available along frequently used routes at relevant times.',
        'A resident objects that this approach is harder to summarize in a single number.',
        'The volunteers agree, but explain that an easy count can encourage a project to succeed on paper while missing the problem it was intended to solve.',
        'They ask the city to state its goal first, then select measures that show whether everyday journeys are becoming more comfortable.'
    ],[['pedestrian','보행자'],['mature','충분히 자라다'],['relief','불편함의 완화']], [
        ['fact','What do the volunteers record on their walks?','Existing shade and places where people wait.','The price of every house along the wide road.','Only the number of trees planted that week.','Only residents who prefer shelters to trees.','오전과 오후에 걸으며 그늘과 보행자 대기 장소를 기록합니다.',[4]],
        ['main','Which statement best expresses the argument?','Judge success against the project’s purpose.','A project is better when it can be reported in one number.','Low planting costs show where people most need shade.','Immediate shelters make long-term tree care unnecessary.','나무 수라는 쉬운 수치보다 실제 일상 이동의 쾌적함이라는 목표에 맞는 측정이 필요합니다.',[1,7,9,10]],
        ['reference','What does “it” in “it was intended to solve” refer to?','A project.','An easy count.','A single number.','A resident.','문제를 해결하도록 의도된 대상은 앞의 project입니다.',[9]],
        ['vocabulary','What does “on paper” mean in sentence 10?','In reported figures rather than in actual experience.','In a handwritten record rather than on a computer.','In an inexpensive plan rather than in an approved one.','In a map drawing rather than on a particular route.','수치로는 성공처럼 보여도 실제 목표는 놓칠 수 있다는 대조입니다.',[9]],
        ['inference','A city plants 500 trees on an empty road; shaded walking time stays unchanged. How would the group assess this?','More trees alone do not prove greater walking comfort.','The journey-comfort goal is met because 500 is a large count.','The tree count should be reduced to exclude the empty road from records.','The project proves that trees cannot offer benefits to a district.','식재 수 증가와 사람들이 다니는 길의 편안함 향상은 같은 성과가 아닙니다.',[1,2,7,10],'challenge'],
        ['inference','Which plan best combines the group’s short- and long-term reasoning?','Shade a busy waiting point now and maintain nearby trees as they grow.','Plant quickly on the cheapest road and stop checking after planting.','Build shelters everywhere and remove trees before they become mature.','Wait for young trees to grow before offering any shade at the crossing.','지금 필요한 대기 장소의 그늘과 나무가 성장하며 주는 장기 이점을 함께 고려합니다.',[5,6,7],'challenge'],
        ['evidence','Which finding would most directly support the group’s claim of improved everyday journeys?','More midday users can wait and walk in shade on the mapped routes.','More photographs of new trees appear in the city’s annual report.','The project’s planting total is easier to remember than last year’s.','More trees are planted where land preparation costs the least.','관련 시간대의 실제 이용 경로에서 그늘 이용이 늘어야 목표 달성을 직접 뒷받침합니다.',[3,4,7,10],'challenge']
    ]);

    add('high1','b','The Book That Nobody Took',[
        'A neighborhood book-exchange shelf begins with a simple instruction: leave a book you no longer need and take one you would like to read.',
        'After a month, the organizers celebrate the large number of books received, but a volunteer notices that several old textbooks remain untouched.',
        'The shelf is full, making it difficult to see newer books behind them, and visitors sometimes leave without finding anything suitable.',
        'One organizer proposes removing every book that has remained for two weeks.',
        'Another points out that a useful book in a less common language may wait longer because only a few visitors can read it.',
        'They decide to try a more careful process rather than use time on the shelf as the only test of value.',
        'Volunteers group books by type, display a rotating selection at the front, and invite visitors to request kinds of books that are missing.',
        'For textbooks, they check whether the information is still useful and look for schools or recycling services that can accept unwanted copies.',
        'They record books taken, requests met, and space available, in addition to the number of donations.',
        'The shelf’s purpose, they conclude, is to connect books with readers, not to store the greatest possible pile of paper.',
        'A successful exchange may therefore receive fewer books while helping more visitors find something they actually want to read.'
    ],[['donation','기부된 물품'],['rotating selection','순서를 바꾸어 전시하는 책 묶음'],['suitable','알맞은']], [
        ['fact','What problem does the full shelf create?','Newer books behind other books are hard to see.','Visitors must buy a textbook before taking a book.','All books in less common languages disappear.','Volunteers can no longer receive requests from visitors.','오래 머문 책들이 자리를 차지해 뒤의 새로운 책을 보기 어렵게 합니다.',[1,2]],
        ['main','What is the passage mainly about?','Judging a book exchange by how well it connects books and readers.','Using donation totals to choose the neighborhood’s most popular books.','Removing less common languages to make a shelf easier to manage.','Keeping old textbooks until every visitor has taken one home.','기부 권수 자체보다 독자가 필요한 책을 찾는 기능에 맞춰 운영과 측정을 바꿉니다.',[5,6,8,9,10]],
        ['reference','What does “them” in sentence 3 refer to?','The remaining old textbooks.','The visitors who ask for newer books.','The organizers celebrating donations.','The schools accepting unwanted copies.','새 책이 뒤에 가려지게 만드는 앞 문장의 오래된 교과서들을 가리킵니다.',[1,2]],
        ['vocabulary','What does “requests met” in sentence 9 mean?','Requests that have been satisfied.','Visitors who have met each other.','Books left beside a request form.','Volunteers assigned to count requests.','방문자의 책 요청이 실제로 충족된 경우를 측정한다는 뜻입니다.',[6,8]],
        ['inference','Why could a strict two-week removal rule conflict with the shelf’s purpose?','It may miss the needs of less frequent readers.','It would prevent volunteers from ever knowing when books arrive.','It would guarantee that every remaining textbook is outdated.','It may force more visitors to donate books in common languages.','이용 독자가 적은 언어의 유용한 책은 적합한 독자를 만날 때까지 더 오래 걸릴 수 있습니다.',[3,4,9],'challenge'],
        ['inference','Donations fall, but more visitors find requested books and shelf space improves. Which conclusion fits?','Fewer donations can coexist with a better service.','The exchange is failing because every measure must increase together.','The results prove that all old textbooks should have been kept.','The exchange should stop collecting requests to restore its old total.','목적에 맞는 독자 연결과 공간이 개선된다면 기부 수 감소만으로 실패라 할 수 없습니다.',[8,9,10],'challenge'],
        ['evidence','Which comparison most directly checks whether the front display helps readers find books?','Before-and-after rates of finding suitable books.','The total number of donated pages before volunteers read the requests.','The number of languages listed on textbooks that remain untouched.','The number of organizers who prefer a large pile of donated books.','전시 변경의 목적은 책을 쉽게 보고 찾게 하는 것이므로 실제로 알맞은 책을 찾은 비율이 직접적인 근거입니다.',[2,6,9],'challenge']
    ]);

    add('high2','a','The Deposit and the Cup',[
        'A campus café replaces disposable cups with reusable ones and asks customers to pay a small deposit, which is returned when a cup is brought back.',
        'During the first month, the café buys fewer disposable cups and announces that the scheme has reduced waste.',
        'A student committee welcomes the change but distinguishes a promising sign from a complete evaluation.',
        'Some reusable cups remain in offices for weeks, so the café must purchase replacements even though those cups may eventually return.',
        'Washing also uses water and energy, and the environmental cost of making a reusable cup is higher than that of making one disposable cup.',
        'These facts do not show that the scheme is harmful; they show why the number of successful reuses matters.',
        'The committee proposes tracking returns, repeated uses, replacement purchases, and washing resources over a longer period.',
        'It also interviews evening students, who explain that the only return desk closes before their final classes end.',
        'The café installs a secure return box near the exit without raising the deposit.',
        'Returns increase afterward, but the committee avoids claiming that a higher financial penalty caused the improvement: the deposit has not changed.',
        'Instead, the results are consistent with the idea that making the desired action easier can matter alongside financial incentives.',
        'For its next report, the café will describe what improved, what costs were included, and which long-term effects remain uncertain.',
        'The committee hopes this will make the project more credible than a single impressive waste-reduction figure could.'
    ],[['deposit','반납하면 돌려받는 보증금'],['disposable','일회용의'],['incentive','행동을 유도하는 유인'],['credible','믿을 만한']], [
        ['fact','What changes immediately before returns increase?','A secure return box near the exit.','The café raises the deposit for every cup.','Evening classes are moved to the morning.','Reusable cups stop requiring any washing.','보증금은 그대로 두고 출구 근처에 반납함을 설치했습니다.',[8,9]],
        ['main','Which statement best represents the committee’s approach?','Assess the policy’s costs, use patterns, and limits.','Judge a reuse policy solely by the number of disposable cups purchased.','Treat the manufacturing cost of one cup as proof that reuse must fail.','Increase financial penalties whenever customers face practical obstacles.','반복 사용과 자원 비용, 반납의 실제 제약을 함께 보며 단정하지 않는 접근입니다.',[2,4,5,6,11]],
        ['reference','What does “These facts” in sentence 6 refer to?','Delayed returns, replacement purchases, and resource costs.','The unchanged deposit and the newly installed exit box.','The café’s final report and its impressive reduction figure.','The evening students’ classes and the closed return desk.','앞 두 문장에서 말한 회수 지연·대체 구매·세척 및 제작 비용을 가리킵니다.',[3,4,5]],
        ['vocabulary','What does “consistent with” in sentence 11 mean?','Compatible with, though not conclusive proof of.','In direct conflict with, despite clear evidence for.','Identical in meaning to, without any further conditions.','Unrelated to, although collected at the same place.','반납 편의성의 영향이라는 설명과 들어맞지만 그것만으로 인과를 완전히 입증했다는 뜻은 아닙니다.',[8,9,10]],
        ['inference','Why cannot the increased returns be attributed to a higher deposit?','Returns changed while the deposit stayed fixed.','The cups were used more often than disposable cups.','Evening students paid no deposit during the first month.','The committee stopped counting cups that remained in offices.','올라가지 않은 보증금의 인상이 결과를 만들었다고 설명할 수 없습니다.',[8,9],'challenge'],
        ['inference','Two cafés buy the same number of reusable cups. Café A reuses each many times; Café B frequently replaces missing ones. Why might their outcomes differ?','The resources spent per completed use can differ substantially.','The identical purchase count guarantees equal environmental costs.','The café with more replacements must use less washing water.','The reuse count matters only if neither café collects a deposit.','제작과 대체에 드는 자원을 실제 사용 횟수에 비추어 봐야 하므로 컵 구매 수만 같다고 성과가 같지 않습니다.',[3,4,5,6],'challenge'],
        ['evidence','Which evidence would most strengthen the claim that evening access was a barrier?','Previously late evening users return sooner via the new box.','Morning users say that the deposit amount is easy to remember.','The café orders more reusable cups before installing the return box.','A poster reports fewer disposable purchases without listing return times.','문제가 제기된 집단이 개선된 반납 경로를 실제로 이용해 지연을 줄였다는 근거가 설명을 강화합니다.',[7,8,10],'challenge']
    ]);

    add('high2','b','A Better Score, a Narrower Lesson',[
        'A language center introduces a short weekly vocabulary test and rewards classes whose average score rises the most.',
        'The test is intended to indicate whether students can understand useful words in context, but it repeatedly uses the same sample sentences.',
        'After several weeks, one class makes a dramatic improvement.',
        'Its teacher has encouraged students to practice recalling the exact tested sentences, and many students can now select the right options almost immediately.',
        'When the center presents the words in unfamiliar but accessible sentences, however, the class’s advantage becomes much smaller.',
        'The director does not conclude that remembering examples has no learning value.',
        'Instead, she distinguishes practice that supports understanding from practice that makes a particular test easier without a comparable gain in understanding.',
        'The center keeps some familiar examples for teaching but creates separate assessment items that use new situations and different combinations of known words.',
        'It checks that these items do not depend on grammar or specialist knowledge students have not been taught.',
        'Teachers also see results for individual words and contexts, rather than a single class average, so a high score cannot hide a persistent weakness in one area.',
        'Rewards are revised to recognize improvement across several assessments instead of the largest jump on one repeated test.',
        'This change does not remove the need to study; it directs studying toward an ability the center actually wants to measure.',
        'The director describes a fair test as one that changes the surface of the task while preserving the learning demand, rather than surprising students with unrelated difficulties.'
    ],[['persistent','계속 남는'],['assessment','평가'],['surface','겉으로 드러난 형태'],['comparable','비슷한 정도의']], [
        ['fact','What happens when the words appear in unfamiliar accessible sentences?','The class retains a much smaller score advantage.','The words are replaced with specialist vocabulary.','The teacher stops using every familiar example.','The center rewards the largest single score jump.','새롭지만 이해할 수 있는 문장에서 평가하면 기존 반의 우위가 줄어듭니다.',[4]],
        ['main','What problem does the center try to solve?','Repeated testing can favor answer recall over flexible understanding.','Useful vocabulary cannot be learned from repeated practice of any kind.','A fair test must present grammar that students have not encountered.','Class averages are more informative than results for specific contexts.','같은 문장 반복으로 점수가 높아지는 것과 새로운 문맥에서의 이해를 구별하려 합니다.',[1,3,4,6,7]],
        ['reference','What does “these items” in sentence 9 refer to?','Separate assessment items using new situations.','The exact sample sentences repeatedly practiced.','The rewards based on the largest weekly jump.','The individual words students have never studied.','앞 문장에서 새로 만드는 평가 문항들을 가리킵니다.',[7,8]],
        ['vocabulary','What does “hide” mean in sentence 10?','Make less noticeable in the overall result.','Remove permanently from a student’s memory.','Deliberately delete from every written record.','Change an incorrect answer into a correct one.','전체 평균이 높으면 특정 영역의 남은 약점이 덜 드러날 수 있다는 뜻입니다.',[9]],
        ['inference','Which new item best follows the director’s idea of fairness?','Apply already taught language in a different everyday situation.','Keep the old answer position while changing only the sentence number.','Introduce technical terms to ensure that every sentence looks new.','Repeat the tested sentence but require a faster response each week.','학습한 범위의 요구는 유지하면서 새로운 상황에 적용하도록 해야 합니다.',[7,8,12],'challenge'],
        ['inference','A student recalls an example perfectly but misunderstands the same word in a new sentence. What can be concluded?','Recall is demonstrated; flexible understanding needs fresh testing.','The student has learned nothing from practicing the example.','The new sentence must contain grammar outside the taught range.','The repeated test already proves understanding across all contexts.','예문 암기 능력은 확인되지만 다른 문맥의 이해까지 입증하지는 못합니다. 암기 자체의 가치는 부정하지 않습니다.',[3,4,5,6],'challenge'],
        ['evidence','Which result most directly supports improvement in the target ability?','Accurate interpretation in new, language-appropriate contexts.','A shorter response time on an unchanged set of answer choices.','A larger average jump after practicing exact tested sentences.','A higher reward after the teacher removes individual-word results.','목표는 문맥 속 단어 이해이므로 배운 언어로 된 여러 새 문맥에서 맞게 이해하는 결과가 직접 근거입니다.',[1,7,8,10,12],'challenge']
    ]);

    add('high3','a','The Archive with the Missing Voices',[
        'A local museum digitizes letters and builds a searchable archive for students studying the town’s past.',
        'The project appears more objective than earlier exhibitions: users can examine hundreds of original documents instead of a curator’s brief selection.',
        'An archivist notes that access to surviving evidence does not remove the conditions under which it was produced and preserved.',
        'Most letters in the collection were written by property-owning families who had the resources to keep personal papers.',
        'Workers who moved frequently left fewer documents, and some accounts of unpaid domestic labor were never written down.',
        'A search returning few references to these experiences therefore cannot establish that the experiences were unimportant or uncommon.',
        'The museum adds a description of the collection’s origins and identifies significant gaps, without claiming to know precisely what the missing documents would have said.',
        'It also links oral histories collected later, clearly distinguishing the date of an event from the date on which a person recalled it.',
        'A student suggests combining every source into a single timeline and treating all statements as equally direct evidence.',
        'The archivist explains that different sources can illuminate the same event while requiring different questions about memory, purpose, and proximity to what occurred.',
        'A letter written during a dispute may reveal the writer’s immediate concerns but not the views of everyone involved; a later interview may supply another perspective without reproducing the past perfectly.',
        'Rather than replacing one simple story with an opposite simple story, the museum encourages users to compare accounts and state the limits of their conclusions.',
        'Its aim is to make the archive easier to investigate, not to make uncertainty disappear behind a larger number of searchable pages.',
        'Students are asked to explain both what a chosen source supports and what additional evidence would be needed for a broader claim.'
    ],[['archive','기록 보관소·자료 모음'],['curator','전시 기획 담당자'],['proximity','사건과 시간적·직접적으로 가까운 정도'],['oral history','구술로 수집한 역사 기록']], [
        ['fact','Whose letters make up most of the collection?','Property-owning families able to preserve their papers.','Those of workers who frequently moved between towns.','Those of students conducting recent archive searches.','Those of interviewers recording unpaid domestic labor.','자료를 보존할 자원이 있던 재산 소유 가정의 편지가 대부분입니다.',[3]],
        ['main','Which statement best expresses the passage’s argument?','Accessible sources need scrutiny of how evidence was both created and preserved.','Digitized original documents remove the need to question a historical account.','Later interviews should replace contemporary letters whenever the accounts differ.','Missing records allow researchers to reconstruct unheard voices with precision.','디지털 접근성이 높아져도 생산·보존의 편향과 자료별 한계를 검토해야 합니다.',[2,5,6,9,12]],
        ['reference','What does “these experiences” in sentence 6 refer to?','Experiences underrepresented in workers’ and domestic-labor records.','The museum’s attempts to make hundreds of letters searchable.','The property-owning families’ ability to preserve personal papers.','The students’ comparisons of previous museum exhibitions.','앞 문장의 이동이 잦은 노동자와 기록되지 않은 가사 노동 경험을 가리킵니다.',[4,5]],
        ['vocabulary','What does “illuminate” mean in sentence 10?','Help explain aspects of a topic.','Give direct physical evidence of.','Settle every disagreement about.','Change the remembered date of.','서로 다른 자료가 같은 사건의 여러 면을 이해하는 데 도움을 준다는 뜻이지 완벽한 재현은 아닙니다.',[9,10]],
        ['inference','A search finds many owners’ complaints and few workers’ accounts. Which conclusion is best supported?','Preservation patterns must be considered before comparing the groups’ concerns.','The owners experienced more hardship because they wrote more surviving letters.','Workers were satisfied because few complaints appear in searchable records.','The museum can fill the gap by assuming workers held the opposite view.','남은 자료의 수가 당시 경험의 빈도나 심각성을 그대로 보여 주지 않으므로 보존 조건을 확인해야 합니다.',[3,4,5,6],'challenge'],
        ['inference','A later interview conflicts with a letter written during an event. Which response follows the archivist’s approach?','Compare the sources’ perspectives and limits for the specific disputed claim.','Prefer the interview because later sources contain more time for reflection.','Prefer the letter for every claim because its date is closer to the event.','Average the two accounts and present the middle position as direct evidence.','동시대 편지와 사후 회상은 각기 목적·기억·직접성의 한계가 달라 주장별 검토가 필요합니다.',[7,9,10,11],'challenge'],
        ['evidence','A student claims the whole town supported a policy because one preserved letter praises it. What is most needed?','Evidence from additional social groups and viewpoints on that policy.','A clearer digital scan of the same praising letter with larger text.','A timeline displaying that letter as the earliest searchable document.','A second copy of the same letter stored under a different family name.','한 사람의 견해를 마을 전체로 확대하려면 다른 집단의 관점을 보여 주는 추가 근거가 필요합니다.',[3,4,10,13],'challenge']
    ]);

    add('high3','b','Fast Routes and Fair Access',[
        'A public clinic tests medicine delivery for patients who find travelling difficult, using software to group addresses into efficient routes.',
        'During the trial, the average time per delivery falls, and the clinic can complete more deliveries with the same number of drivers.',
        'The software ranks route plans mainly by total travel time; it does not directly consider how long each patient has waited since requesting medicine.',
        'Because nearby addresses are easier to combine, patients in a distant village are repeatedly moved to the following day, although they requested service earlier than some patients in town.',
        'The project manager initially describes this as an unfortunate but necessary cost of efficiency.',
        'A nurse asks whether efficiency is defined too narrowly for a service intended to provide reliable access for people with limited alternatives.',
        'She does not propose ignoring distance or sending a separate driver for every request.',
        'Instead, she suggests comparing route plans subject to an additional rule: no eligible request should be postponed beyond a stated waiting limit.',
        'Among plans meeting that condition, the software could still choose one with a short total travel time.',
        'The clinic tests the revised rule and finds that some routes become longer, while the number of requests exceeding the limit declines.',
        'It reports both changes, together with the number of completed deliveries, rather than treating one average as a complete account of performance.',
        'The manager notes that the trial does not settle what the waiting limit should be or how additional resources should be funded.',
        'Those decisions require discussion with patients and staff, informed by the costs and consequences of different choices.',
        'The lesson is not that optimization is useless, but that a system can efficiently pursue an incomplete objective.',
        'Explicit obligations allow technical tools to support a considered goal instead of quietly defining that goal for everyone.'
    ],[['eligible','서비스를 받을 자격이 있는'],['optimization','정해진 목표에 맞는 가장 좋은 방식을 찾는 과정'],['objective','달성하려는 목표'],['postpone','뒤로 미루다']], [
        ['fact','What does the original software mainly minimize?','Total travel time across routes.','Each patient’s waiting time.','The number of eligible requests.','Each driver’s number of medicines.','처음 프로그램의 주요 판단 기준은 전체 이동 시간입니다.',[2]],
        ['main','Which statement best expresses the central lesson?','An efficient service must also account for its public delivery obligations.','Public services must abandon route planning when some trips become longer.','A lower average delivery time establishes fair access for every patient.','Technical tools should choose the waiting limit without patient input.','효율 자체를 부정하지 않고 공적 서비스의 책임을 포함한 목표를 명시해야 한다는 주장입니다.',[5,7,8,13,14]],
        ['reference','What does “that condition” in sentence 9 refer to?','Keeping eligible requests within the agreed waiting limit.','Completing every delivery with a separate driver.','Grouping only addresses that are close to the clinic.','Reducing travel time below its original trial average.','직전 문장의 일정 대기 한도 초과 연기 금지 조건입니다.',[7,8]],
        ['vocabulary','What does “subject to” mean in sentence 8?','Required to satisfy.','Intended to remove.','Measured instead of.','Unable to influence.','경로를 비교하되 추가 규칙을 충족하는 범위 안에서 고른다는 뜻입니다.',[7,8]],
        ['inference','Plan A has the shortest travel time but violates the waiting limit. Plan B meets it with a slightly longer route. Under the proposed rule, what follows?','Plan B meets the stated constraint; Plan A is therefore excluded.','Plan A must be selected because travel time is the original objective.','Both plans are equally eligible because each completes some deliveries.','Neither plan is eligible unless their travel times are identical.','대기 한도는 먼저 충족해야 할 조건이며 그 안에서 이동 시간을 줄이는 구조입니다.',[7,8],'challenge'],
        ['inference','Why does a lower overall average not answer the nurse’s concern?','A better overall average can hide repeated delays for a particular group.','Averages are unrelated to the total time needed by the drivers.','The nurse wants every patient to receive medicine at the same minute.','The village patients have been shown to request ineligible medicines.','전체 평균 개선과 먼 마을의 반복 지연은 동시에 생길 수 있으므로 접근성 문제를 별도로 봐야 합니다.',[1,3,5,10],'challenge'],
        ['evidence','Which report best supports a transparent decision about the revised rule?','Total travel time, completed deliveries, and overdue requests.','Only the faster of the two average travel times from the trial.','The route plan selected without disclosing the waiting condition.','Only comments from town patients served early by the first system.','효율·처리량·대기 한도 초과를 함께 제시해야 비용과 접근성 변화를 비교할 수 있습니다.',[9,10,11,12],'challenge']
    ]);
    root.MockEnglishTransfer = passages;
})(typeof window !== 'undefined' ? window : globalThis);
