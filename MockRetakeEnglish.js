(function (root) {
    'use strict';
    // Original retake-only reading passages; evidence indices refer to the zero-based lines array.
    const passages = [];
    function add(gradeId, variant, title, lines, glossary, rows) {
        const id = `mock-retake-en-${gradeId}-${variant}`;
        passages.push({ id, gradeId, title, lines,
            glossary: glossary.map(([word, meaning]) => ({ word, meaning })),
            grammarProfile: 'grade-aligned-reading',
            questions: rows.map((row, index) => {
                const [skill, question, answer, a, b, c, explanation, evidenceLines, difficulty = 'standard'] = row;
                const choices = [answer, a, b, c];
                const shift = (index + gradeId.length + variant.charCodeAt(0)) % 4;
                return { id: `${id}-q${index + 1}`, skill, question, answer,
                    choices: choices.slice(shift).concat(choices.slice(0, shift)), explanation, evidenceLines, difficulty,
                    cognitiveDemand: difficulty === 'challenge' ? 'reasoning' : 'application' };
            }) });
    }

    add('grade6', 'a', 'The Scarf by the Bench', [
        'After school, Leo finds a red scarf on a bench near the school gate.',
        'He wants to find its owner, but there is no name on it.',
        'His friend Nari says, "Put a picture of the scarf on our class board."',
        'Leo takes a picture but keeps it off the board because an owner should describe the scarf first.',
        'He writes, "I found a scarf. Please tell me its color and where you lost it."',
        'The next morning, Hana says her red scarf fell beside the gate yesterday.',
        'Leo shows her the scarf, and she points to a small white star on one end.',
        'He sees the star and gives the scarf back to her.'
    ], [['owner', '주인'], ['describe', '어떤 모습인지 설명하다']], [
        ['fact', 'Where does Leo find the scarf?', 'On the bench by the gate.', 'On a desk in his classroom.', 'Under a chair beside the board.', 'In a bag near the bus stop.', '첫 줄에서 학교 문 근처 벤치 위에서 발견했다고 말합니다.', [0]],
        ['main', 'What is this passage mainly about?', 'Finding the right owner of a lost scarf.', 'Choosing a present for a new classmate.', 'Taking pictures of stars after school.', 'Making a new board for the classroom.', '분실물의 특징을 확인하며 주인에게 돌려주는 과정이 중심입니다.', [0, 4, 5, 6, 7]],
        ['reference', 'What does “it” in line 4 refer to?', 'The scarf’s picture.', 'The class board.', 'The school gate.', 'The small white star.', 'Leo가 찍은 뒤 게시판에 올리지 않은 것은 스카프 사진입니다.', [2, 3]],
        ['vocabulary', 'What does “points to” in line 7 mean?', 'Shows where something is with a finger.', 'Hides something inside a pocket.', 'Draws something with a colored pen.', 'Gives something to another person.', 'Hana는 스카프 끝의 별 위치를 가리켜 자기 물건의 특징을 보여 줍니다.', [6]],
        ['inference', 'Why does Leo keep the picture off the board?', 'He wants the owner to describe it first.', 'He has no place to write a notice.', 'He wants to keep the scarf as a gift.', 'He has forgotten exactly where he found it.', '사진을 먼저 보면 특징을 따라 말할 수 있으므로 주인이 먼저 설명하게 하려는 행동입니다.', [3, 4], 'challenge'],
        ['inference', 'A student says only, “That scarf is mine.” What best follows Leo’s method?', 'Ask its color and where it was lost.', 'Give the scarf to the student immediately.', 'Post its picture before asking anything.', 'Move the scarf to the bench again.', '안내문에서 요구한 색과 잃어버린 장소를 확인해야 Leo의 방식과 맞습니다.', [3, 4], 'challenge'],
        ['evidence', 'Which detail helps confirm Hana knows this particular scarf?', 'She recognizes its small white star.', 'She goes to school the next morning.', 'She reads a notice on the class board.', 'She has a friend who takes pictures.', '색과 장소에 더해 실제 스카프의 작은 흰 별을 알아본 점이 구체적인 확인 근거입니다.', [5, 6, 7], 'challenge']
    ]);

    add('grade6', 'b', 'One More Page', [
        'Ella reads a short story to her little brother Tom every evening.',
        'At first, she turns each page as soon as she finishes reading its words.',
        'Tom often asks her to go back because he is still looking at the pictures.',
        'On Friday, Ella tries something new and lets Tom turn the pages.',
        'Sometimes he waits, and sometimes he points to an animal and asks a question.',
        'They read fewer pages that evening, but Tom talks about the story at breakfast the next day.',
        'He remembers where the small fox hides and why it leaves its home.',
        'Ella decides to leave more time for pictures and questions when they read together again.'
    ], [['fox', '여우'], ['decide', '결정하다']], [
        ['fact', 'Who turns the pages on Friday?', 'Tom.', 'Ella.', 'Their teacher.', 'Their father.', '금요일에는 Ella가 Tom에게 페이지를 넘기게 합니다.', [3]],
        ['main', 'What does Ella learn from reading with Tom?', 'Giving time for pictures and questions can help him enjoy the story.', 'Reading the most pages always makes the best evening.', 'Choosing books without animals makes reading easier.', 'Talking at breakfast prevents children from remembering books.', '더 천천히 읽은 뒤 Tom이 내용을 기억하고 이야기하는 것을 보고 그림과 질문 시간을 늘립니다.', [4, 5, 6, 7]],
        ['reference', 'What does “it” in line 7 refer to?', 'The small fox.', 'The story.', 'The picture.', 'The breakfast.', '숨고 집을 떠나는 주체는 바로 앞의 small fox입니다.', [6]],
        ['vocabulary', 'What does “go back” in line 3 mean here?', 'Return to an earlier page.', 'Leave the house at once.', 'Read a different book next.', 'Put the book on a shelf.', '그림을 아직 보고 있으므로 앞서 넘긴 페이지로 돌아가 달라는 뜻입니다.', [1, 2]],
        ['inference', 'Why does Tom ask Ella to go back at first?', 'She turns pages before he finishes looking.', 'The book has no words beside its pictures.', 'He wants to finish before the evening begins.', 'Ella keeps choosing a different story each minute.', '글을 다 읽자마자 넘기는 속도와 Tom이 그림을 살펴보는 속도가 맞지 않습니다.', [1, 2], 'challenge'],
        ['inference', 'Which action would fit Ella’s decision at their next reading?', 'Pause when Tom asks about a picture.', 'Turn every page before Tom can look.', 'Stop Tom from talking about the animals.', 'Count pages instead of listening to questions.', '마지막 줄에서 그림과 질문에 시간을 더 주기로 했으므로 질문할 때 멈추는 행동이 맞습니다.', [7], 'challenge'],
        ['evidence', 'Which fact suggests that fewer pages did not stop Tom from following the story?', 'He recalls the fox’s hiding place and reason for leaving.', 'Ella finishes reading the words on each page.', 'They usually read together in the evening.', 'Friday comes before their next breakfast.', '다음 날 장소와 행동 이유를 기억한 것이 내용 이해의 근거입니다.', [5, 6], 'challenge']
    ]);

    add('middle1', 'a', 'The Quiet Part of the Play', [
        'A school drama club is preparing a play for families, and Ben is responsible for the sound between scenes.',
        'During the first practice, he plays music whenever the actors stop speaking because he thinks silence will make the audience uncomfortable.',
        'However, the director asks him to leave one pause silent: a girl has just discovered that her friend is moving away.',
        'Ben worries that the audience will think he has forgotten to start the music, so the club invites six students to watch that scene.',
        'Afterward, four students say the quiet moment helped them notice the girl’s face, while two think the pause lasted too long.',
        'The club shortens the pause slightly but keeps it free of music, and Ben marks its beginning and end in his script.',
        'At the next practice, he follows those marks instead of filling every empty moment with a song.',
        'He realizes that his job includes choosing when a sound should be heard and when the actors should have the space to show a feeling.'
    ], [['scene', '장면'], ['script', '대본'], ['director', '연출자']], [
        ['fact', 'What does the club do after hearing the six students’ comments?', 'Shortens the silent pause slightly.', 'Adds music throughout the pause.', 'Removes the girl from the scene.', 'Asks the families to leave early.', '의견을 들은 뒤 침묵은 유지하면서 멈춤 시간을 약간 줄입니다.', [4, 5]],
        ['main', 'What is Ben’s main discovery?', 'Silence can be a deliberate part of sound design.', 'Every scene needs a longer musical introduction.', 'A small audience cannot give useful feedback.', 'An actor’s expression should always follow a song.', '소리를 넣지 않는 순간도 감정 표현을 위한 의도적 선택이 될 수 있음을 배웁니다.', [2, 7]],
        ['reference', 'What does “those marks” in line 7 refer to?', 'The marked beginning and end of the pause.', 'The students’ written family invitations.', 'The director’s list of songs for the play.', 'The marks showing where actors stand.', '바로 앞 줄에서 Ben이 대본에 표시한 침묵의 시작과 끝을 말합니다.', [5, 6]],
        ['vocabulary', 'What does “filling” in line 7 mean in this context?', 'Using music throughout.', 'Writing names beside.', 'Removing people from.', 'Making a recording of.', '빈 순간마다 노래를 넣던 행동을 말하므로 음악으로 채운다는 뜻입니다.', [1, 6]],
        ['inference', 'Why does Ben mark the pause in his script?', 'To carry out the planned silence consistently.', 'To avoid watching any of the actors.', 'To show that the students chose the songs.', 'To replace the director at the next practice.', '침묵을 실수가 아닌 계획된 길이로 유지하기 위한 표시로 볼 수 있습니다.', [3, 5, 6], 'challenge'],
        ['inference', 'Which new scene would most likely suit the same approach?', 'A character silently struggles to say goodbye.', 'A dance begins only when a loud song starts.', 'An announcer asks everyone to sing together.', 'A musician demonstrates three different instruments.', '말없이 표정으로 이별 감정을 드러내는 장면이 소리를 비워 배우의 감정에 집중하게 한 취지와 맞습니다.', [2, 4, 7], 'challenge'],
        ['evidence', 'Which comment most directly supports keeping some silence?', 'Four noticed her face during the silence.', 'Two students felt the pause lasted too long.', 'Ben is responsible for sound between scenes.', 'The play will be performed for families.', '침묵 덕분에 표정을 보았다는 의견이 침묵의 효과를 직접 뒷받침합니다. 길이가 길다는 의견은 시간 조정 근거입니다.', [4], 'challenge']
    ]);

    add('middle1', 'b', 'The Picture Exchange', [
        'For the school art exchange, each student brings one drawing in an envelope and receives a drawing made by someone else.',
        'Ms. Park asks students to write their names inside the envelopes, where visitors cannot see them before choosing.',
        'She hopes students will choose pictures they like instead of choosing only work by their closest friends.',
        'Jin puts a drawing of a crowded market on the table, but he feels nervous when several students walk past it.',
        'Near the end, a younger student selects his envelope and tells him that the tiny shop signs remind her of a place she visited with her grandmother.',
        'Jin had expected someone to choose his drawing because of its bright colors, so her comment surprises him.',
        'When he receives a simple pencil drawing of a bicycle, he first notices that it has no color at all.',
        'Then he sees the careful lines around the wheels and thinks about the many ways a picture can interest another person.',
        'The exchange ends without a prize or a vote for the best artist.'
    ], [['envelope', '봉투'], ['crowded', '붐비는'], ['wheel', '바퀴']], [
        ['fact', 'Where should students write their names?', 'Inside the envelopes.', 'On the front of the table.', 'Across the drawing’s center.', 'On a list for visitors to see.', '방문객이 고르기 전에 볼 수 없도록 봉투 안에 이름을 적습니다.', [1]],
        ['main', 'Which idea best fits the passage?', 'Pictures can appeal for different reasons.', 'Colorful art always receives the highest prize.', 'An exchange works only among close friends.', 'Every artist should draw familiar shops.', 'Jin이 예상한 색, 선택한 학생의 추억, 자전거 그림의 선처럼 감상 이유가 다양합니다.', [4, 5, 6, 7]],
        ['reference', 'What does “her comment” in line 6 refer to?', 'The younger student’s comment on the signs.', 'Ms. Park’s instruction about the envelopes.', 'The grandmother’s description of a bicycle.', 'A visitor’s request to add brighter colors.', '바로 앞 줄에서 어린 학생이 가게 간판이 할머니와 간 장소를 떠올리게 한다고 한 말입니다.', [4, 5]],
        ['vocabulary', 'What does “selects” in line 5 mean?', 'Chooses.', 'Repairs.', 'Draws.', 'Drops.', '교환할 그림의 봉투를 고르는 상황입니다.', [0, 4]],
        ['inference', 'How does hiding names support Ms. Park’s goal?', 'It reduces the chance of choosing mainly by friendship.', 'It guarantees that all pictures look equally good.', 'It lets students take several envelopes at once.', 'It makes bright colors less visible to visitors.', '작가 이름을 미리 알 수 없게 하여 친분보다 그림을 보고 선택하게 하려는 목적입니다.', [1, 2], 'challenge'],
        ['inference', 'How does Jin’s view of the bicycle drawing change?', 'He begins to value its lines despite the lack of color.', 'He decides that an uncolored drawing cannot be interesting.', 'He learns that the bicycle belonged to his grandmother.', 'He asks the student to replace the drawing with a market.', '처음에는 색이 없음을 보지만 이후 정교한 바퀴 선에 주목하며 감상의 폭을 넓힙니다.', [6, 7], 'challenge'],
        ['evidence', 'Which detail shows that the younger student’s reason differs from Jin’s expectation?', 'She values a memory; he expects praise for color.', 'She takes an envelope, whereas he brings one to school.', 'She is younger, whereas he knows Ms. Park’s name.', 'She visits the table, whereas he draws at home.', '그는 밝은 색 때문에 고를 것으로 예상했지만 학생은 간판이 떠올린 개인적 추억을 말합니다.', [4, 5], 'challenge']
    ]);

    add('middle2', 'a', 'A Trail You Can Hear', [
        'A nature club is making an audio guide for a short walking trail behind the town library.',
        'The first version tells visitors to turn left at a tall tree and stop beside a group of yellow flowers.',
        'When the club tests it in autumn, the flowers are gone, and two listeners walk past the correct turning point.',
        'One member suggests replacing the descriptions with exact distances, but another notes that visitors may walk at different speeds and may not measure their steps.',
        'The club instead records directions using features that are likely to remain: the stone bridge, the wooden fence, and numbered posts installed along the path.',
        'It keeps seasonal information in separate short tracks so that those details can be changed without recording the directions again.',
        'For a second test, volunteers who have never visited the trail follow the guide without a club member walking beside them.',
        'After the walk, they report where they felt uncertain, even if they eventually found the right way.',
        'The club wants a guide that works for new visitors, rather than one that seems clear only to people who already know the route.'
    ], [['audio guide', '음성 안내'], ['post', '말뚝 모양의 표지'], ['seasonal', '계절에 따른']], [
        ['fact', 'What caused a problem during the autumn test?', 'The yellow flowers had disappeared.', 'The library had closed its doors.', 'Every numbered post had been removed.', 'A club member changed the bridge.', '첫 안내에서 기준으로 삼은 꽃이 가을에는 없어 두 명이 갈림 지점을 지나쳤습니다.', [1, 2]],
        ['main', 'What is the club mainly improving?', 'A trail guide’s clarity for first-time visitors.', 'The speed at which all visitors walk the trail.', 'The number of flowers planted behind the library.', 'The club members’ ability to memorize distances.', '변하는 기준을 수정하고 초행자에게 시험하여 길을 모르는 방문객에게도 통하는 안내를 만듭니다.', [4, 6, 8]],
        ['reference', 'What does “those details” in line 6 refer to?', 'The seasonal information.', 'The numbered posts.', 'The exact walking distances.', 'The volunteers’ names.', '별도 짧은 녹음으로 분리한 계절 정보의 세부 내용을 가리킵니다.', [5]],
        ['vocabulary', 'What does “uncertain” in line 8 mean?', 'Not sure about what to do.', 'Unable to hear any sound.', 'Tired from walking too fast.', 'Interested in joining the club.', '결국 길을 찾았더라도 어느 곳에서 방향을 확신하지 못했는지 보고하는 문맥입니다.', [7]],
        ['inference', 'Why are seasonal tracks separated from the directions?', 'They can be updated while the stable route instructions remain.', 'They prevent visitors from hearing about flowers.', 'They make every visitor walk at the same speed.', 'They remove the need to test the route with anyone.', '계절 정보만 바꿀 때 길 안내 전체를 다시 녹음하지 않게 하려는 구조입니다.', [4, 5], 'challenge'],
        ['inference', 'Why should the second-test volunteers walk without a club member beside them?', 'A companion’s help could mask unclear directions.', 'The club member would be unable to recognize the bridge.', 'The volunteers need to replace all the numbered posts.', 'The club wants to learn which person can walk fastest.', '길을 아는 회원이 옆에서 도와주면 초행자가 음성 안내만으로 길을 찾는지 확인하기 어렵습니다.', [6, 8], 'challenge'],
        ['evidence', 'A volunteer hesitates at the fence but eventually chooses the right path. Should the club record this?', 'Yes; the test asks where visitors felt unsure, even when they succeeded.', 'Yes; the test records only the time needed to reach the fence.', 'No; finding the right path means the instructions were always clear.', 'No; only volunteers who became completely lost can give feedback.', '성공 여부뿐 아니라 중간의 불확실한 지점도 수집한다고 명시합니다.', [7], 'challenge']
    ]);

    add('middle2', 'b', 'The Lunch Table Note', [
        'At a weekend music workshop, participants place their lunches on a shared table before the afternoon rehearsal.',
        'Each container carries a name, and a notice says that food may be shared only when its owner has placed a green card beside it.',
        'Maya brings two identical containers of rice rolls, one for herself and one for her sister, who will arrive later.',
        'She places a green card beside her own container because she is happy to offer some rolls to the group.',
        'During a break, a visitor notices that the marked container is empty and reaches for the other one, assuming that identical food has the same permission.',
        'Maya explains that the second container belongs to her sister, so the visitor stops and chooses an apple from a different marked plate.',
        'The organizers realize that a card placed loosely between dishes can be confusing, especially when containers move during the break.',
        'For the next session, they attach a green clip directly to each shareable container and repeat the rule before everyone leaves for rehearsal.',
        'They do not treat the visitor’s mistake as proof that sharing food is impossible; they improve the way permission is shown.'
    ], [['container', '음식을 담는 용기'], ['rehearsal', '합동 연습'], ['clip', '집게']], [
        ['fact', 'Who is the second container of rice rolls for?', 'Maya’s sister.', 'The visiting organizer.', 'All the music teachers.', 'A student arriving next week.', '두 용기 중 하나는 나중에 오는 Maya의 여동생 또는 언니를 위한 것입니다. 영어 sister의 나이는 특정하지 않습니다.', [2, 5]],
        ['main', 'What is the main lesson of the organizers’ response?', 'Make permission easier to identify when confusion occurs.', 'End every shared meal after a single mistake.', 'Allow identical food to be taken without asking.', 'Replace all lunches with the same kind of apple.', '혼란을 이유로 공유를 포기하지 않고 공유 허용 표시가 분명하게 보이도록 바꿉니다.', [6, 7, 8]],
        ['reference', 'What does “the other one” in line 5 refer to?', 'The unmarked container for Maya’s sister.', 'The empty container with the green card.', 'The apple on the different marked plate.', 'The notice beside the shared lunch table.', '공유 표시 용기가 빈 뒤 손을 뻗은 다른 용기는 자매 몫의 용기입니다.', [2, 3, 4, 5]],
        ['vocabulary', 'What does “loosely” in line 7 mean here?', 'Without being firmly attached to a dish.', 'With a strict rule against moving it.', 'In a way that makes its color darker.', 'After being carefully hidden from view.', '접시 사이에 따로 놓인 카드와 용기에 직접 붙이는 집게를 대비하고 있습니다.', [6, 7]],
        ['inference', 'Why is the visitor’s assumption mistaken?', 'Permission applies to each container separately.', 'Rice rolls can never be shared during workshops.', 'Maya has already offered her sister’s lunch to everyone.', 'Food becomes private only when its container is empty.', '음식 모양이 같아도 각 용기의 주인이 허락한 것만 공유할 수 있습니다.', [1, 2, 3, 4, 5], 'challenge'],
        ['inference', 'How does attaching a clip directly improve the system?', 'The marker moves with the container.', 'Every participant will bring an identical container.', 'The clip tells people how many rolls to eat.', 'The sister will no longer arrive after the break.', '용기를 옮겨도 허용 표시가 그 용기에 붙어 있으므로 어느 음식의 표시인지 혼동을 줄입니다.', [6, 7], 'challenge'],
        ['evidence', 'Which action shows that the visitor accepts Maya’s explanation?', 'Choosing an apple from a different marked plate.', 'Noticing the empty container during the break.', 'Reaching toward the sister’s container.', 'Assuming that identical food has equal permission.', '설명을 들은 뒤 손을 멈추고 별도로 허용 표시된 사과를 선택한 행동이 근거입니다.', [5]],
    ]);

    add('middle3', 'a', 'An Invitation beyond the Map', [
        'A town museum designs a walking map that connects five small exhibitions in different neighborhood shops.',
        'The printed route begins at the station, which the designers assume will be the most convenient starting point for visitors.',
        'A shop owner at the opposite end worries that people will become tired before reaching her exhibition and skip it.',
        'Rather than simply moving her shop to the top of the page, the museum asks how visitors actually arrive.',
        'A brief survey finds that some come by train, others walk from the river, and several enter from a bus stop beside the owner’s shop.',
        'The next map therefore shows three entrances and allows visitors to begin at any of them, while keeping the same five exhibitions.',
        'It also gives the walking time between neighboring stops instead of a single total time for a route that everyone must follow.',
        'The owner agrees to display a welcome sign near the bus stop, directing arriving visitors to the closest exhibition.',
        'The museum plans to ask visitors which entrances they used, because the new layout is still a proposal to be evaluated.',
        'The change treats a map as an invitation with several possible beginnings, rather than a command to experience the town in one fixed order.'
    ], [['exhibition', '전시'], ['entrance', '들어오는 지점'], ['layout', '배치 방식']], [
        ['fact', 'How many exhibitions remain on the revised map?', 'Five.', 'Three.', 'Six.', 'Eight.', '출발 지점은 세 곳이 되지만 같은 다섯 전시를 유지합니다.', [0, 5]],
        ['main', 'What is the central idea of the map revision?', 'Let different arrival points guide the route choice.', 'Place every exhibition inside the station building.', 'Require every visitor to finish at the owner’s shop.', 'Remove walking information from museum materials.', '방문객이 실제로 오는 여러 경로에 맞추어 어느 지점에서든 시작할 수 있게 바꿉니다.', [4, 5, 6, 9]],
        ['reference', 'What does “them” in line 6 refer to?', 'The three entrances.', 'The five exhibitions.', 'The museum’s designers.', 'The surveyed visitors.', 'at any of them은 바로 앞에 제시된 세 진입 지점 중 어디서든 시작한다는 뜻입니다.', [5]],
        ['vocabulary', 'What does “fixed” in line 10 mean?', 'Set and unchanging.', 'Broken and repaired.', 'Short and pleasant.', 'Hidden and unknown.', '한 가지 정해진 순서를 따르도록 명령하는 방식과 여러 출발을 허용하는 방식을 대비합니다.', [9]],
        ['inference', 'Why would merely moving the owner’s shop to the top of the page be insufficient?', 'It would replace one favored start with another.', 'It would increase the number of exhibitions to visit.', 'It would force all trains to stop near the river.', 'It would remove the need for a welcome sign.', '불만을 낸 가게를 맨 앞에 두기만 하면 단일 출발점 가정 자체는 해결되지 않습니다.', [1, 2, 3, 4, 5], 'challenge'],
        ['inference', 'A visitor enters at the river and has little time. Which feature is most useful for planning a short visit?', 'Walking times between neighboring stops.', 'An instruction to begin only at the station.', 'A list of the designers’ favorite exhibitions.', 'A total time for one compulsory full route.', '구간별 시간이 있으면 자신의 출발점에서 가까운 일부 전시를 골라 시간을 계획할 수 있습니다.', [5, 6], 'challenge'],
        ['evidence', 'Which detail prevents us from claiming the revision has already solved the owner’s concern?', 'The museum still plans to collect entrance-use information.', 'The revised map includes all five exhibitions.', 'The owner will put a sign by the bus stop.', 'The survey found more than one arrival point.', '새 배치는 평가할 제안이며 사용 지점을 앞으로 조사한다고 하므로 효과가 이미 입증된 것은 아닙니다.', [8], 'challenge']
    ]);

    add('middle3', 'b', 'A Repair Fair’s Second List', [
        'At the first neighborhood repair fair, volunteers fix lamps, bags, and small toys that residents would otherwise throw away.',
        'The organizers proudly announce that they have repaired sixty objects, but volunteer Sam asks what happened to the objects they could not repair.',
        'The original list records only successful repairs, so it cannot show whether many residents left without useful advice.',
        'For the second fair, the team adds a separate record of unsuccessful cases and the reasons for them, without collecting owners’ names.',
        'It turns out that several objects need a replacement part that is cheap but unavailable at the event.',
        'Other objects require specialist equipment, and the volunteers explain this limitation instead of attempting work beyond their skills.',
        'The team begins offering written information about where to find common parts and which local services handle specialist repairs.',
        'It also asks residents a month later whether the advice helped them repair an object elsewhere or decide what to do next.',
        'A rising repair count will still be welcome, but the organizers now see value in recording a difficulty when that record can lead to more helpful support.'
    ], [['replacement part', '교체용 부품'], ['specialist', '전문적인 기술을 가진 사람의'], ['limitation', '능력이나 조건의 한계']], [
        ['fact', 'What information is deliberately excluded from the new unsuccessful-case record?', 'The owners’ names.', 'The reasons repairs failed.', 'The need for replacement parts.', 'The need for specialist equipment.', '실패 이유는 기록하지만 소유자의 이름은 수집하지 않는다고 명시합니다.', [3]],
        ['main', 'What does the second record help the team do?', 'Learn from unsuccessful repairs and improve its support.', 'Prove that every damaged object can be repaired at the fair.', 'Replace trained specialists with inexperienced volunteers.', 'Remove all numbers from future event reports.', '실패 사례의 이유를 알아내 부품 정보, 전문 서비스 안내, 후속 확인으로 지원을 넓힙니다.', [3, 4, 5, 6, 7, 8]],
        ['reference', 'What does “them” in line 4 refer to?', 'The unsuccessful cases.', 'The owners’ names.', 'The original organizers.', 'The successful repair counts.', '기록할 실패 사례와 그 사례가 실패한 이유를 말합니다.', [3]],
        ['vocabulary', 'What does “handle” in line 7 mean?', 'Deal with or carry out.', 'Carry by a small strap.', 'Count without examining.', 'Cancel before announcing.', '어떤 지역 업체가 전문 수리를 담당하는지 알려 주는 문맥입니다.', [5, 6]],
        ['inference', 'Why can the original count of sixty repairs give an incomplete picture?', 'It omits residents who left without a repair.', 'It includes the names of all residents who attended.', 'It proves that no object needed a replacement part.', 'It measures only how many volunteers joined the fair.', '성공한 개수만으로는 수리하지 못한 사람들의 규모나 필요한 지원을 알 수 없습니다.', [1, 2], 'challenge'],
        ['inference', 'Which case best matches the new kind of useful support?', 'A lamp owner later repairs it using the part information.', 'A volunteer records a successful repair without checking the object.', 'An organizer counts the same fixed toy several times.', 'A resident’s name is added to a public list of failures.', '현장 수리가 안 되어도 부품 정보를 통해 나중에 해결했다면 확장된 지원의 가치에 맞습니다.', [4, 6, 7, 8], 'challenge'],
        ['evidence', 'Which action directly checks whether advice led to help after the event?', 'Asking residents about the outcome a month later.', 'Announcing sixty successful repairs at the first fair.', 'Avoiding owners’ names in the unsuccessful-case list.', 'Not attempting work beyond the volunteers’ skills.', '한 달 뒤 실제 수리나 다음 결정에 도움이 되었는지 물어 후속 효과를 확인합니다.', [7]],
    ]);

    add('high1', 'a', 'Who Speaks in the Recording?', [
        'When a local archive invites residents to record memories of an old cinema, student editor Rosa expects to produce a single smooth account of its history.',
        'Most early interviews describe lively Saturday evenings, so she arranges those stories around a cheerful opening scene and adds music from a recent school performance.',
        'Later, a former cleaner recalls working alone after the audience left, while a nearby resident remembers being unable to sleep because of the departing crowds.',
        'Rosa initially considers leaving these interviews out because they interrupt the mood, although neither speaker disputes that many people enjoyed visiting the cinema.',
        'Her supervisor asks whether a consistent mood is the same thing as a faithful record, and Rosa notices that her editing has quietly turned one group’s experience into everyone’s experience.',
        'In the revised recording, she keeps the enjoyable memories but places the cleaner’s and neighbor’s accounts alongside them, clearly identifying each speaker’s connection to the building.',
        'She also removes music from moments where it makes a neutral description sound either joyful or threatening, allowing the speaker’s own words more room.',
        'The finished piece does not claim that all memories are equally complete or precise; it simply avoids presenting one viewpoint as the only viewpoint that existed.',
        'Visitors can listen to the original interviews through separate links, while a short note explains how the edited sequence was assembled and why some passages were shortened.',
        'Rosa now treats an attractive story as something that must answer to the evidence, even when the evidence makes the story less comfortable to tell.'
    ], [['archive', '기록을 수집하고 보관하는 기관'], ['faithful', '대상을 충실하게 반영하는'], ['sequence', '배열된 순서']], [
        ['fact', 'Why did Rosa first consider excluding two later interviews?', 'They disrupted the cheerful mood she had created.', 'Their speakers denied that anyone enjoyed the cinema.', 'They contained no memories of the cinema building.', 'Their speakers refused to let the archive use them.', '두 인터뷰가 분위기를 끊는다고 생각했기 때문이며, 즐긴 사람이 있었다는 사실을 부정한 것은 아닙니다.', [2, 3]],
        ['main', 'What principle does Rosa adopt?', 'A compelling account should remain accountable to varied evidence.', 'An archive should avoid editing any interview for length.', 'The largest group’s memories should replace all other accounts.', 'Background music is necessary to make historical evidence reliable.', '매끄러운 이야기라도 다양한 증거에 맞게 수정해야 한다는 태도로 바뀝니다.', [4, 7, 9]],
        ['reference', 'What does “them” in line 6 refer to?', 'The enjoyable memories.', 'The original interview links.', 'The cleaner and the neighbor.', 'The short explanatory notes.', 'alongside them은 즐거웠던 기억 옆에 청소 노동자와 이웃의 이야기도 둔다는 뜻입니다.', [5]],
        ['vocabulary', 'What does “assembled” in line 9 mean?', 'Put together in a chosen arrangement.', 'Accepted without any examination.', 'Translated into another language.', 'Recovered after being permanently lost.', '편집 순서를 어떻게 구성했는지 설명하는 문맥이므로 모아 배열한다는 뜻입니다.', [8]],
        ['inference', 'Why identify each speaker’s connection to the cinema?', 'It helps listeners understand why their experiences may differ.', 'It allows listeners to assume the oldest speaker is always correct.', 'It proves that every memory has been independently verified.', 'It makes access to the original interviews unnecessary.', '관객, 청소 노동자, 이웃처럼 입장이 다름을 알려 경험 차이를 해석하게 합니다. 정확성을 모두 보증하는 것은 아닙니다.', [2, 5, 7], 'challenge'],
        ['inference', 'Which editing decision would most conflict with Rosa’s revised approach?', 'Using ominous music to turn a neutral crowd account into a threat.', 'Keeping a pleasant memory beside a less pleasant recollection.', 'Explaining why a long interview was shortened in the final piece.', 'Providing a link so listeners can hear an interview in full.', '중립적인 말을 음악으로 위협적으로 느끼게 하는 것은 말의 인상을 왜곡하지 않으려는 수정 취지와 충돌합니다.', [6, 8], 'challenge'],
        ['evidence', 'Which feature most directly lets visitors examine what was omitted during editing?', 'Links to the original interviews.', 'A cheerful opening scene.', 'A label naming the former cleaner.', 'Music from the school performance.', '원본을 들을 수 있어 편집본과 비교하여 생략된 내용을 직접 확인할 수 있습니다.', [8], 'challenge']
    ]);

    add('high1', 'b', 'The Timetable with Two Answers', [
        'The organizers of a community science festival promise that visitors will find every demonstration on a printed timetable handed out at the entrance.',
        'On the morning of the event, a presenter’s train is delayed, and the team moves her demonstration from eleven o’clock to two in the afternoon.',
        'A volunteer updates the festival website immediately, but hundreds of printed copies already give the original time, and some visitors have no phone with them.',
        'At first, the team proposes telling people to consult the website whenever they are unsure; however, the entrance desk reports that many visitors confidently follow their paper copies without realizing a change has occurred.',
        'The organizers decide that correcting information means more than placing a correct answer somewhere, because people also need a reason and an opportunity to notice the correction.',
        'They put a large change notice at the entrance and outside the demonstration room, announcing both the original time and the revised time so visitors can recognize the affected session.',
        'Volunteers also tell incoming groups about the change and mark the remaining paper copies, while the website displays the time of its latest update.',
        'After the festival, the team considers abandoning print altogether, but interviews reveal that several families used the paper schedule together while one person kept the only phone in a bag.',
        'For future events, the team retains printed schedules and plans a clear correction procedure across the website, signs, and entrance desk.',
        'Its goal becomes maintaining a shared understanding of the program, rather than assuming that the existence of one updated page guarantees that everyone has received the news.'
    ], [['demonstration', '시연 행사'], ['revised', '수정된'], ['procedure', '정해 놓은 처리 절차']], [
        ['fact', 'What is the demonstration’s new starting time?', 'Two in the afternoon.', 'Eleven in the morning.', 'One in the afternoon.', 'Ten in the morning.', '시연을 오전 11시에서 오후 2시로 옮겼습니다.', [1]],
        ['main', 'What is the passage’s central point?', 'An update must reach the people who rely on the old information.', 'Websites should always replace printed schedules at public events.', 'Delayed presenters should choose their own replacement sessions.', 'Visitors should memorize every event time before entering.', '맞는 정보를 한 곳에 올리는 데서 끝나지 않고 기존 정보를 믿는 사람들에게 변경이 전달되어야 합니다.', [3, 4, 9]],
        ['reference', 'What does “its” in line 7 refer to?', 'The website.', 'The entrance desk.', 'The demonstration room.', 'The printed timetable.', '웹사이트가 그 웹사이트의 마지막 갱신 시각을 표시한다는 뜻입니다.', [6]],
        ['vocabulary', 'What does “retains” in line 9 mean?', 'Keeps using.', 'Stops distributing.', 'Forgets to prepare.', 'Makes less accurate.', '인쇄물을 없앨지 검토했지만 앞으로도 유지하며 정정 절차를 준비하기로 합니다.', [7, 8]],
        ['inference', 'Why does the change notice mention the original time as well as the new one?', 'It helps old-schedule users recognize the changed session.', 'It allows both demonstrations to happen at the same time.', 'It makes the reason for the train delay unnecessary to explain.', 'Visitors must choose which of the two times they prefer.', '종이에 적힌 원래 시간을 본 사람이 자신의 일정에서 바뀐 시연을 알아보게 합니다.', [3, 5], 'challenge'],
        ['inference', 'What assumption is challenged by the family interviews?', 'Every visitor can conveniently use a personal phone schedule.', 'Families need information about the festival program.', 'The printed copies were produced before the train delay.', 'A website can show when its information was last changed.', '종이를 함께 보거나 전화기가 없는 방문객이 있으므로 모두에게 개인 휴대전화 이용이 편리하다고 가정할 수 없습니다.', [2, 7], 'challenge'],
        ['evidence', 'Which observation most directly shows why an accurate website alone was insufficient?', 'Visitors trusted paper copies and missed the change.', 'The presenter’s train was delayed on the festival morning.', 'The team handed out timetables at the entrance.', 'The website was updated immediately by a volunteer.', '정보가 틀렸다는 사실을 모르는 사람은 웹사이트를 확인할 이유도 없으므로 능동적인 변경 안내가 필요합니다.', [3, 4], 'challenge']
    ]);

    add('high2', 'a', 'A Label That Travels', [
        'A small museum asks two translators to prepare an English label for a handmade bowl whose local name literally means “the bowl that waits.”',
        'The name refers to a custom in which a family keeps a portion of food for a person who is expected home later, a practice unfamiliar to many international visitors.',
        'One translator prefers to preserve the literal name because its unusual wording may invite curiosity, while the other proposes “a bowl for someone coming home” to make the function immediately clear.',
        'The curator initially treats the choice as a contest between accuracy and accessibility, but a trial with visitors reveals that each version leaves a different question unanswered.',
        'Readers of the literal version often assume the bowl was used to measure waiting time, whereas readers of the explanatory version understand the use but never realize that the object has a distinctive local name.',
        'The team responds with a layered label: a short heading preserves the translated name, and the next sentence explains the custom through a concrete example of a late arriving family member.',
        'Below that explanation, a brief quotation from a maker describes what keeping a portion meant in her own household, without claiming that every family followed exactly the same custom.',
        'Visitors who want a quick explanation can stop after the first two lines, while those interested in personal experience can continue reading.',
        'The translators then test whether readers can explain both the object’s use and the reason for its name, instead of simply asking which version sounds more elegant.',
        'Their final decision does not remove every cultural difference; it makes that difference approachable while giving visitors enough guidance to avoid a plausible but mistaken interpretation.'
    ], [['literal', '말의 표면적 뜻을 그대로 옮긴'], ['curator', '전시를 기획하고 관리하는 사람'], ['portion', '음식의 한 사람 몫']], [
        ['fact', 'What custom explains the bowl’s local name?', 'Keeping food for a family member expected home later.', 'Measuring the time needed for a bowl to dry.', 'Giving the first bowl made each year to a museum.', 'Waiting until every visitor has read the same label.', '늦게 귀가할 사람의 몫을 남겨 두는 풍습에서 이름이 왔다고 명시합니다.', [1]],
        ['main', 'What is the team’s solution to the translation problem?', 'Keep the name, explain the custom, and add a personal example.', 'Replace the local name entirely with a universal technical term.', 'Let visitors guess the object’s purpose from the literal name alone.', 'Ask makers to agree on one custom that every family practiced.', '고유한 이름을 살리되 쉬운 기능 설명과 더 읽을 수 있는 개인 이야기를 층으로 제공합니다.', [5, 6, 7]],
        ['reference', 'What does “its name” in line 9 refer to?', 'The bowl’s name.', 'The museum’s name.', 'The maker’s name.', 'The translator’s name.', '독자가 설명해야 하는 것은 물건의 용도와 그 물건에 이름이 붙은 이유입니다.', [8]],
        ['vocabulary', 'What does “approachable” in line 10 mean here?', 'Easier for visitors to engage with and understand.', 'Certain to be practiced by every visiting family.', 'Physically closer to the museum entrance.', 'Fully identical to every visitor’s own custom.', '문화 차이를 없애는 대신 설명으로 독자가 이해하고 접근할 수 있게 만든다는 뜻입니다.', [5, 7, 9]],
        ['inference', 'Why does the maker’s quotation avoid speaking for all families?', 'One household’s experience does not establish a universal practice.', 'The quotation has no connection with the bowl’s use.', 'The translators have proved that the custom never existed.', 'All families agreed to keep their experiences secret.', '한 제작자의 집안 경험으로 모든 가정의 풍습이 같다고 일반화하지 않으려는 표현입니다.', [6], 'challenge'],
        ['inference', 'Which response best indicates that the layered label works as intended?', 'A reader links the reserved food and the name to a person’s later return.', 'A reader prefers the label’s typeface but cannot describe the bowl’s use.', 'A reader concludes that the bowl measures minutes until dinner.', 'A reader remembers the maker’s name but assumes the local name was omitted.', '최종 검사는 용도와 이름의 이유를 모두 설명하는지 보므로 이 두 요소를 연결한 응답이 적합합니다.', [1, 8], 'challenge'],
        ['evidence', 'Which finding most directly supports keeping an explanation alongside the literal name?', 'Some readers mistake the name for a reference to measuring time.', 'One translator thinks unusual wording may invite curiosity.', 'Some visitors prefer to read only the first two lines.', 'A maker can describe a custom in her own household.', '직역 이름만으로 실제 용도와 다른 시간 측정 도구로 해석하는 독자가 있어 명시적 설명이 필요합니다.', [4, 5], 'challenge']
    ]);

    add('high2', 'b', 'The Light after Closing', [
        'A community center leaves its courtyard lights on until midnight because evening visitors say the bright space feels welcoming after classes end.',
        'Residents living directly across the courtyard report that the same lights shine through their bedroom windows, while the caretaker worries about people crossing a completely dark area.',
        'At a meeting, the discussion first divides into two options: maintain the current lighting or switch every lamp off when the final class finishes.',
        'An electrician suggests a third arrangement in which low lamps illuminate the walking path and taller lamps are directed away from the apartments, with a timer reducing brightness later at night.',
        'The center tries this arrangement for three weeks and asks both visitors and nearby residents to keep brief notes, including the time and place of any problem.',
        'Visitors generally report that they can still see the path, while some residents say their rooms are darker; however, one resident continues to notice glare from a lamp near the gate.',
        'The team treats this remaining complaint as information about a specific location rather than dismissing it because the average response has improved.',
        'It adjusts that lamp and extends the trial for another week, keeping the previous comments so that the new responses can be compared with them.',
        'Because attendance varies across evenings, the center does not interpret a quiet night with no complaints as conclusive proof that the problem has disappeared.',
        'The process shifts the question from which group should surrender its needs to which parts of the lighting can be changed, observed, and changed again in response to those needs.'
    ], [['courtyard', '건물 사이의 안뜰'], ['caretaker', '시설 관리인'], ['glare', '눈부시게 들어오는 빛']], [
        ['fact', 'What problem remains after the first three-week trial?', 'Glare from a lamp near the gate.', 'All path lamps stop working after class.', 'No visitors can see the walking path.', 'Every resident’s bedroom becomes brighter.', '대체로 개선 의견이 있지만 한 주민은 문 근처 등에서 계속 빛이 들어온다고 말합니다.', [5]],
        ['main', 'What approach does the center eventually take?', 'Revise individual lamps and check the effects on both groups.', 'Accept only the opinion held by the largest group.', 'Leave every lamp unchanged until all complaints stop.', 'Require residents to attend evening classes before commenting.', '집단 중 하나를 희생시키는 양자택일에서 구체적 조정과 관찰을 반복하는 방식으로 바뀝니다.', [3, 4, 6, 7, 9]],
        ['reference', 'What does “them” in line 8 refer to?', 'The previous comments.', 'The apartment windows.', 'The taller lamps.', 'The evening visitors.', '새로운 반응을 비교할 대상은 보관한 이전 의견입니다.', [7]],
        ['vocabulary', 'What does “conclusive” in line 9 mean?', 'Strong enough to settle the question.', 'Easy to record without a date.', 'Unrelated to the lighting problem.', 'Likely to please every visitor.', '이용자 수가 다른 밤의 무민원만으로 해결을 확정할 수 없다는 문맥이므로 결론을 확정할 만큼 결정적이라는 뜻입니다.', [8]],
        ['inference', 'Why does the team ask for the time and location of problems?', 'The details help locate what needs adjustment.', 'They determine which residents are allowed to sleep early.', 'They guarantee equal attendance on every evening.', 'They replace the need to hear visitors’ experiences.', '문 근처 특정 등을 조정하듯 시간과 위치 정보는 어디를 언제 바꿀지 판단하게 합니다.', [4, 5, 6, 7], 'challenge'],
        ['inference', 'Why would an improved average response be an insufficient reason to ignore the gate complaint?', 'An overall improvement can coexist with a serious problem at one location.', 'Averages prove that every individual response is unreliable.', 'The resident’s report establishes that all path lighting must be removed.', 'The original meeting required the gate lamp to remain untouched.', '평균적 개선이 특정 장소에 남은 문제의 부재를 뜻하지 않으므로 개별 근거를 살펴봅니다.', [5, 6], 'challenge'],
        ['evidence', 'Which detail weakens the claim that one complaint-free night proves success?', 'The number of people attending varies between evenings.', 'The new lamps illuminate the walking path.', 'The electrician suggested directing lamps away from apartments.', 'The center saved the earlier comments for comparison.', '어떤 밤은 이용자가 적어 민원 기회도 줄 수 있으므로 무민원만으로 문제 소멸을 확정하기 어렵습니다.', [8], 'challenge']
    ]);

    add('high3', 'a', 'A Name above the Comment', [
        'An online writing seminar introduces anonymous peer review because several participants admit that they hesitate to criticize a story written by an experienced member.',
        'In the first round, removing names produces more direct comments, and the organizer concludes that anonymity has made the discussion fairer.',
        'Yet a closer reading reveals another pattern: some reviewers confidently call a narrator’s unfamiliar expressions incorrect, even though the story uses those expressions deliberately to represent a particular community.',
        'The writers’ names are hidden, but assumptions about which language sounds normal remain visible in the judgments, so anonymity has removed one influence without removing all influences.',
        'The organizer therefore keeps names hidden during the initial review but asks reviewers to separate three things: what they observe in the text, how they interpret it, and what change they recommend.',
        'Reviewers must also explain what a proposed change would help a reader understand and identify any uncertainty about the narrator’s intended voice.',
        'In a second round, writers can respond to comments before revising, sometimes accepting a suggestion and sometimes explaining why a disputed expression is necessary.',
        'This exchange does not give writers an automatic right to reject every criticism as misunderstanding; it makes the reasoning behind both a comment and a response available for discussion.',
        'To evaluate the revised process, the organizer examines whether comments lead to specific, supported choices rather than merely counting how many negative remarks participants are willing to post.',
        'Fairness is thus treated as an ongoing practice of making judgments open to examination, not as a quality permanently guaranteed by hiding a name above the text.'
    ], [['anonymity', '이름이나 신원을 드러내지 않는 상태'], ['narrator', '이야기 속 서술자'], ['peer review', '동료끼리 서로의 글을 검토하는 활동']], [
        ['fact', 'What three elements must reviewers separate in the revised process?', 'Observation, interpretation, and recommendation.', 'Writer’s age, experience, and popularity.', 'Spelling, punctuation, and publication date.', 'Praise, silence, and automatic rejection.', '다섯째 줄에 관찰한 내용, 해석, 권하는 변화를 구분하도록 명시합니다.', [4]],
        ['main', 'Which statement best captures the argument?', 'Anonymity can help, but the reasons behind judgments also need scrutiny.', 'Anonymous criticism is always less fair than criticism bearing a name.', 'Writers should have sole authority to decide whether every comment is valid.', 'The number of negative comments is the most reliable measure of a review process.', '익명화가 한 영향을 줄일 수는 있어도 판단 전제를 드러내 검토하는 절차까지 필요하다는 주장입니다.', [3, 4, 7, 8, 9]],
        ['reference', 'What does “it” in line 8 refer to?', 'The exchange between writers and reviewers.', 'The narrator’s unfamiliar expression.', 'The first anonymous review round.', 'The writer’s automatic right to reject criticism.', '바로 앞의 This exchange를 이어 받아 교환 과정이 양쪽 이유를 토론할 수 있게 한다고 말합니다.', [6, 7]],
        ['vocabulary', 'What does “disputed” in line 7 mean?', 'Questioned or disagreed about.', 'Repeated without any change.', 'Published without a writer’s name.', 'Praised for being easy to understand.', '비평에서 문제 삼은 표현을 작가가 왜 필요한지 설명하는 상황이므로 이견이 있거나 문제로 제기된 표현이라는 뜻입니다.', [6], 'standard'],
        ['inference', 'What does the unfamiliar-expression example reveal about anonymous review?', 'Shared language assumptions can shape comments even when authors are unknown.', 'Removing names prevents reviewers from making any confident statement.', 'A community’s speech is automatically suitable for every story regardless of purpose.', 'Experienced writers are the only people who use unfamiliar expressions deliberately.', '이름이 감춰져도 정상 언어에 대한 가정은 판단에 남을 수 있음을 보여 줍니다.', [2, 3], 'challenge'],
        ['inference', 'Which comment best follows the revised review method?', '“This phrase appears twice; I read it as anger, but if you intend affection, another cue might help.”', '“This phrase appears twice; I do not know it, so remove both uses, since unfamiliar expressions are always errors.”', '“I think this phrase is awkward, but I cannot explain why; my experience should be enough for you to accept the change.”', '“I cannot judge the story until I know how experienced its author is.”', '구체적 관찰, 자신의 해석, 의도의 불확실성, 독자 이해를 도울 제안을 모두 드러내는 의견입니다.', [4, 5], 'challenge'],
        ['evidence', 'Which planned evaluation best matches the organizer’s revised understanding of fairness?', 'Checking how comments justify specific revision choices.', 'Checking whether every writer accepts every suggested revision.', 'Counting only comments that contain a negative adjective.', 'Ranking reviewers by how long they have attended the seminar.', '단순 부정 의견 수가 아니라 구체적이고 근거 있는 선택으로 이어지는지 확인한다고 명시합니다.', [8]],
    ]);

    add('high3', 'b', 'The Archive of an Empty Field', [
        'When a disused sports field is proposed as the site of a new public garden, a planning team begins an archive of how the space has served the neighborhood.',
        'Official records show few organized matches during the previous decade, and a preliminary report describes the field as largely unused, strengthening the argument that a new function would be an improvement.',
        'However, a volunteer who regularly crosses the field notices people teaching children to ride bicycles, practicing dance, and meeting after work without booking it for an official activity.',
        'These uses leave little trace in the booking system, which was designed to manage organized events rather than document everything residents do in an open space.',
        'The team expands its inquiry through observations at different times and an invitation for residents to submit accounts, while acknowledging that people with more free time may be more able to respond.',
        'The new material does not prove that the field should remain unchanged, since some current users also want shade, seating, and places where children can safely gather.',
        'Instead, it changes the question from whether an empty space needs a purpose to how a redesign might support existing practices as well as introduce new possibilities.',
        'A revised proposal reserves a broad open area beside planted sections and explains which reported activities each feature is intended to accommodate.',
        'Before approving a final design, the team displays temporary markings on the field and asks residents to try using the proposed spaces, recording conflicts as well as positive reactions.',
        'The archive’s value lies less in delivering a single verdict about the past than in revealing what the original records could not show and making the consequences of a future choice easier to examine.'
    ], [['disused', '본래 용도로 더 이상 쓰이지 않는'], ['preliminary', '초기의, 예비 단계의'], ['accommodate', '필요를 수용하다']], [
        ['fact', 'What activities were poorly represented in the booking records?', 'Informal uses made without a booking.', 'Organized matches booked through the official system.', 'Garden workshops held after final approval.', 'Meetings held only inside the planning office.', '자전거 배우기, 춤 연습 등 예약하지 않는 일상적 이용은 공식 예약 기록에 거의 남지 않습니다.', [2, 3]],
        ['main', 'What is the passage’s main argument?', 'Records have limits; finding their omissions can guide redesign.', 'All spaces without official matches should immediately become gardens.', 'Resident submissions always provide a complete and unbiased record.', 'An archive is useful only when it proves that no physical change is needed.', '기록의 목적과 누락을 인식해 실제 쓰임을 조사하고 재설계의 결과를 검토하는 과정이 중심입니다.', [3, 4, 6, 9]],
        ['reference', 'What does “it” in line 3 refer to?', 'The sports field.', 'The booking system.', 'The public garden proposal.', 'The preliminary report.', 'booking it은 주민들이 운동장을 공식 활동으로 예약하는 것을 말합니다.', [0, 2]],
        ['vocabulary', 'What does “verdict” in line 10 mean?', 'A final judgment.', 'A written invitation.', 'A physical boundary.', 'A scheduled match.', '과거에 대한 하나의 최종 결론을 내리는 것보다 기록의 한계와 선택 결과를 드러내는 데 가치가 있다는 문맥입니다.', [9]],
        ['inference', 'Why might the residents’ submitted accounts still be incomplete?', 'Those with more available time may be overrepresented among respondents.', 'Every informal user is already included in the booking system.', 'The team has decided to accept only positive comments about gardens.', 'The field has no current users who want shade or seating.', '응답할 여유가 있는 사람이 더 많이 참여할 수 있음을 팀도 인정하므로 새 자료도 완전한 대표성을 보장하지 않습니다.', [4], 'challenge'],
        ['inference', 'What is the strongest conclusion justified by discovering informal uses?', 'The redesign should consider activities omitted from the original report.', 'The new garden must be canceled because every current use is ideal.', 'Booking records are useless for the organized events they were designed to manage.', 'All residents prefer an unchanged field to any possible garden.', '비공식 이용의 발견은 기존 활동을 고려할 근거이며 변경 반대나 기록 전체의 무가치를 증명하지는 않습니다.', [3, 5, 6], 'challenge'],
        ['evidence', 'Which action most directly tests whether the proposed arrangement supports actual activities?', 'Testing temporary spaces and recording conflicts during use.', 'Describing the field as unused in the preliminary report.', 'Counting only officially organized matches from the last decade.', 'Collecting positive reactions without observing any use of the field.', '가상 배치대로 실제 이용해 보게 하고 충돌도 기록하면 제안된 공간과 활동이 맞는지 확인할 수 있습니다.', [8], 'challenge']
    ]);

    root.MockRetakeReading = root.MockRetakeReading || { korean: [], english: [] };
    root.MockRetakeReading.english = passages;
})(typeof window !== 'undefined' ? window : globalThis);
