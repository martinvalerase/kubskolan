// English texts for Cube School. Laid over the Swedish content in content.js:
// steps, quiz questions, help lines, part names and labels line up by position,
// so only the words live here. Algorithms, masks and step numbers come from content.js.

const DANCE = "R U R' U'";
const sw = face => `<i class="sw sw-${face}"></i>`;
const dances = n => Array.from({ length: n }, (_, k) => `Dance ${k + 1}`);
const SUNE_PARTS = ['First half', 'Second half'];
const TPERM_PARTS = ['The Dance', 'The middle', 'The ending'];
const YPERM_PARTS = ['Start', 'The Dance', 'The ending'];
const U_PARTS = ['Start', 'Spin', 'Finish'];

export const EN = {
  worlds: {
    w0: {
      title: 'Meet the cube',
      short: 'Pieces, colours and the cube’s language',
      quiz: [
        { q: 'Which colour is opposite yellow?', options: ['White', 'Green', 'Red'] },
        { q: 'How many colours does a corner have?', options: ['Three', 'Two', 'One'] },
        { q: 'What does R do?', options: ['Turns the right side up', 'Turns the right side down', 'Turns the top to the left'] },
      ],
      steps: [
        {
          title: 'Hi there, cuber!',
          text: 'This is where you learn to solve the Rubik’s cube, one small step at a time. There’s no rush.<br><br>Drag your finger on the cube to spin it around. Double-tap to put it back.',
        },
        {
          title: 'Centres never move',
          text: `The piece in the middle of each side is fixed in place. It decides what colour that side should be.<br><br>${sw('U')} Yellow is opposite ${sw('D')} white.<br>${sw('F')} Green is opposite ${sw('B')} blue.<br>${sw('L')} Red is opposite ${sw('R')} orange.`,
          rule: 'Check your own cube: is yellow opposite white, and green opposite blue? Then it matches the cube here.',
        },
        {
          title: 'Edges have two colours',
          text: 'An <b>edge</b> sits between two centres. It has <b>two</b> colours. There are 12 edges.',
        },
        {
          title: 'Corners have three colours',
          text: 'A <b>corner</b> has <b>three</b> colours. There are 8 corners. A piece always moves as one whole piece. A corner can never turn into an edge!',
        },
        {
          title: 'Yellow up, green facing you',
          text: 'Always hold the cube with the <b>yellow centre on top</b> and the <b>green centre facing you</b>. Then your cube looks just like the one here.<br><br>We build the cube from the bottom up: the white bottom first, the yellow top last.',
          rule: 'Yellow up, green facing you. Every time!',
        },
        {
          title: 'R means right',
          text: 'Every turn has a letter.<br><br><b>R</b> for <i>Right</i>. <b>R</b> turns the right side <b>UP</b>.<br><b>R\'</b> (say “R prime”) turns it <b>DOWN</b>.<br><br>Try it with the buttons.',
        },
        {
          title: 'U means the top',
          text: '<b>U</b> for <i>Up</i>, which is the top.<br><br><b>U</b> turns the top to the <b>LEFT</b>.<br><b>U\'</b> turns the top to the <b>RIGHT</b>.',
        },
        {
          title: 'F means the front',
          text: '<b>F</b> for <i>Front</i>, the side facing you.<br><br><b>F</b> turns the front <b>clockwise</b>, the same way a clock’s hands go.<br><b>F\'</b> turns it the other way.<br><br>A <b>2</b> after the letter means: do it twice. <b>F2</b> = F F.',
        },
        {
          title: 'The Dance',
          text: `The most important move in the whole method is <b>the Dance</b>: <b>${DANCE}</b><br><br>Right up, top left, right down, top right. Do it with your right hand until it happens all by itself.<br><br>Fun fact: do the Dance 6 times and the cube is back where it started! Tap <b>Follow along</b> and do it on your own cube at the same time.`,
          rule: 'Right up, top left, right down, top right.',
          cube: { parts: dances(6) },
        },
      ],
    },
    w1: {
      title: 'The daisy',
      short: 'Four white edges around the yellow centre',
      quiz: [
        { q: 'Which centre is in the middle of the daisy?', options: ['The yellow one', 'The white one', 'The green one'] },
        { q: 'Which way should the white on the petals point?', options: ['Up', 'Towards you', 'Down'] },
        { q: 'What do you do before you turn a white edge up?', options: ['Turn the top so the spot is empty', 'Do the Dance', 'Flip the cube over'] },
      ],
      steps: [
        {
          title: 'Yellow up, green facing you',
          text: 'Hold the cube with the yellow centre on top and the green centre facing you.<br><br><b>R</b> = right side up. <b>U</b> = top to the left. <b>F</b> = front like a clock.',
        },
        {
          title: 'The goal: a flower',
          text: 'First we build a <b>daisy</b>. The yellow centre is the flower, and the four white edges are its petals.',
          rule: 'Only the white needs to point up. The colour on the other side of the petal doesn’t matter yet.',
        },
        {
          title: 'White edge in the middle, white facing you',
          text: 'The blinking edge is in the middle layer, front right. The white points <b>towards you</b>.<br><br>Turn the right side <b>UP</b> (R). The edge goes up, with white on top.',
          rule: 'Make room first! Turn the top so the spot above the edge doesn’t already have a white petal.',
        },
        {
          title: 'White edge in the middle, white to the side',
          text: 'This time the white points <b>to the right</b>.<br><br>Turn the front <b>backwards</b> (F\'). The edge goes up, with white on top.',
          rule: 'Make room first! The spot above should be empty.',
        },
        {
          title: 'White edge on the bottom, white facing down',
          text: 'Is the white pointing <b>down</b> on the bottom?<br><br>Turn the top so the spot above is empty. Then turn that side <b>twice</b> (F2).',
        },
        {
          title: 'White edge on the bottom, white to the side',
          text: 'Is the edge on the bottom, but the white points <b>to the side</b>? Then we do three small steps:<br><br>1. Turn that side once. Now the edge is in the middle layer.<br>2. Make room on top.<br>3. Turn the edge up, just like in “White edge in the middle”.',
          cube: { parts: ['Up to the middle', 'Make room', 'Up into the flower'] },
        },
        {
          title: 'White points sideways on top',
          text: 'Is a white edge already on top, but the white points <b>to the side</b>? Then we take it down and back up again:<br><br>1. Turn the front (F). Now the edge is in the middle layer.<br>2. Make room on top.<br>3. Turn it up with the right side (R).',
          cube: { parts: ['Down to the middle', 'Make room', 'Back up'] },
        },
        {
          title: 'Your turn!',
          text: 'Mix up your real cube and build a daisy. Take your time. You’ll figure it out!',
          help: [
            ['The edge is in the middle, white facing me'],
            ['The edge is in the middle, white to the side'],
            ['The edge is on the bottom, white facing down'],
            ['The edge is on the bottom, white to the side'],
            ['The edge is on top, but the white points sideways'],
            ['Knocked a petal off? Always turn the top first so the spot is empty.'],
          ],
        },
      ],
    },
    w2: {
      title: 'The white cross',
      short: 'Step C in CFOP: Cross',
      quiz: [
        { q: 'Which colour on the petal do you look at when matching?', options: ['The other colour, not the white', 'The white', 'The corner’s colour'] },
        { q: 'The colour matches the centre. How many times do you turn that side?', options: ['Twice', 'Once', 'Three times'] },
        { q: 'Where does the white cross end up?', options: ['Underneath the cube', 'On top', 'Facing you'] },
      ],
      steps: [
        {
          title: 'The daisy',
          text: 'Four white edges around the yellow centre, white facing up. Got a daisy on your cube? Let’s go!',
        },
        {
          title: 'From flower to cross',
          text: 'Now we move the petals down to the bottom, one at a time. That makes a <b>white cross</b> underneath the cube.',
        },
        {
          title: 'Match it and turn twice',
          text: 'For each petal:<br>1. Look at the petal’s other colour, not the white.<br>2. Turn the <b>top</b> until that colour is above the centre of the same colour.<br>3. Turn that side <b>twice</b>.<br><br>Tap play and watch one petal at a time.',
          rule: 'Match the colour, turn twice.',
          cube: {
            parts: ['Blue already matches', 'Match green and orange', 'Green down', 'Orange down', 'Match red', 'Red down'],
          },
        },
        {
          title: 'Take a peek underneath',
          text: 'Flip the cube over and look: a white cross! And the sides of the cross match the centres. That’s the <b>C</b> in CFOP.',
        },
        {
          title: 'Your turn!',
          text: 'Mix it up, make a daisy, and then make the white cross on your cube.',
          help: [
            ['I don’t know how to match a petal'],
            ['No daisy? Make that first, from the step before.'],
            ['Cross came out wrong? Check that each petal’s colour was above the right centre before you turned twice.'],
          ],
        },
      ],
    },
    w3: {
      title: 'The white corners',
      short: 'The first layer gets finished',
      quiz: [
        { q: 'What tells you where a white corner belongs?', options: ['The corner’s two other colours', 'The white', 'The yellow centre'] },
        { q: 'Where do you hold the corner before you dance?', options: ['Top right, at the front', 'Top left, at the back', 'Bottom left'] },
        { q: 'How many Dances might a corner need?', options: ['1, 3 or 5', 'Always 6', 'Always 2'] },
      ],
      steps: [
        {
          title: 'The white cross',
          text: 'The white cross is underneath the cube, and its edges match the centres. Got that on your cube?',
        },
        {
          title: 'Four white corners',
          text: 'Now the four white corners go down to the bottom, between the arms of the cross. Then the whole first layer is done.<br><br>The blinking corner has the colours <b>white, green and orange</b>.',
        },
        {
          title: 'Find the right spot',
          text: 'The white, green and orange corner belongs <b>between the green and orange centres</b>.<br><br>Turn the top until the corner is right above its spot. Hold the cube so the corner is <b>top right, at the front</b>.',
          rule: 'The corner’s two other colours show where it lives.',
        },
        {
          title: 'Dance until it’s in!',
          text: 'Do <b>the Dance</b> again and again until the corner is in place with white facing down. Count! Sometimes once is enough, sometimes it takes three or five.',
          rule: 'Dance and count: 1, 3 or 5 times.',
          cube: { parts: dances(3) },
        },
        {
          title: 'Sometimes once is enough',
          text: 'Here you only need one Dance. Look at which way the white points before you start, and you’ll learn to spot it.',
          cube: { parts: dances(1) },
        },
        {
          title: 'Stuck in the bottom?',
          text: 'Is a white corner in the bottom but twisted the wrong way? Hold it <b>bottom right, at the front</b> and dance once. It jumps up to the top.<br><br>Is it already above the right spot? Keep dancing until it’s in. If not, turn the top and do what you did in “Find the right spot”.',
          cube: { parts: ['The corner jumps up', 'The corner is in place'] },
        },
        {
          title: 'Your turn!',
          text: 'Make the cross and all four white corners on your cube. Check that every side has a little “T” of one colour.',
          help: [
            ['I don’t know where the corner goes'],
            ['The corner is in the right spot, but I don’t know how many Dances'],
            ['A corner is stuck in the bottom'],
            ['Did the Dance go wrong? Start it again: right up, top left, right down, top right.'],
          ],
        },
      ],
    },
    w4: {
      title: 'The middle layer',
      short: 'Two layers done (F2L, beginner style)',
      quiz: [
        { q: 'Where should the blinking edge go?', options: ['To the right', 'To the left'] },
        { q: 'Which edges on top go down into the middle?', options: ['Edges without yellow', 'Edges with yellow', 'All edges'] },
        { q: 'What do you do first?', options: ['Turn the top away from where the edge goes', 'Turn the top towards where the edge goes', 'Do the Dance six times'] },
      ],
      steps: [
        {
          title: 'The first layer',
          text: 'The whole bottom is white, and every side has a little T of one colour. Got that on your cube?',
        },
        {
          title: 'Four edges in the middle',
          text: 'Now we put the four edges into the middle layer. Then <b>two layers</b> are done. That’s F2L in CFOP!',
        },
        {
          title: 'New letter: L',
          text: '<b>L</b> for <i>Left</i>.<br><br><b>L</b> turns the left side <b>DOWN</b>. <b>L\'</b> turns it <b>UP</b>. That’s the opposite of R!',
        },
        {
          title: 'Make an upside-down T',
          text: 'Find an edge on top <b>without yellow</b>. Here it’s the green-orange edge.<br><br>Turn the top until the edge’s <b>front colour</b> (green) is above the <b>green centre</b>. Now it looks like an upside-down T.<br><br>The edge’s <b>top colour</b> (orange) shows where it goes: to the right, where the orange centre is.',
        },
        {
          title: 'To the right',
          text: 'Does the edge go to the <b>right</b>? Do two short dances:<br><b>The away dance</b>: U R U\' R\'<br><b>The front dance</b>: U\' F\' U F',
          rule: 'First turn the top AWAY from where the edge goes.',
          cube: { parts: ['The away dance', 'The front dance'] },
        },
        {
          title: 'To the left',
          text: 'Does the edge go to the <b>left</b>? Same thing, just mirrored:<br><b>The away dance</b>: U\' L\' U L<br><b>The front dance</b>: U F U\' F\'',
          rule: 'First turn the top AWAY from where the edge goes.',
          cube: { parts: ['The away dance', 'The front dance'] },
        },
        {
          title: 'Stuck in the wrong spot?',
          text: 'Is an edge in the middle but flipped the wrong way? Hold it front right and do <b>To the right</b> once. It jumps up to the top.<br><br>Then make an upside-down T and put it in as usual.',
          cube: { parts: ['The edge jumps up', 'Make the T', 'To the right'] },
        },
        {
          title: 'Your turn!',
          text: 'Solve the first two layers on your cube.',
          help: [
            ['I don’t know if the edge goes right or left'],
            ['The edge goes to the right'],
            ['The edge goes to the left'],
            ['An edge is in the middle but flipped the wrong way'],
            ['Do all the edges on top have yellow? Then an edge is wrong in the middle. See “Stuck in the wrong spot”.'],
          ],
        },
      ],
    },
    w5: {
      title: 'The yellow cross',
      short: 'Step O, part 1: yellow edges',
      quiz: [
        { q: 'Which pattern is this?', options: ['Line', 'L', 'Dot'] },
        { q: 'Which pattern is this?', options: ['L', 'Line', 'Dot'] },
        { q: 'You have a dot. What do you do first?', options: ['The Line algorithm', 'The L algorithm', 'Sune'] },
      ],
      steps: [
        {
          title: 'Two layers done',
          text: 'The bottom two layers are finished. Only the yellow top is left!',
        },
        {
          title: 'Three patterns',
          text: 'Now the top gets a <b>yellow cross</b>. Only look at the edges, the plus sign. Don’t worry about the corners yet.<br><br>Your top looks like one of these pictures. Which one do you have?',
          diagrams: ['Dot', 'L', 'Line'],
        },
        {
          title: 'Line',
          text: 'Hold the line <b>sideways</b>, from left to right, just like in the picture. Then do:<br><b>Front – The Dance – Front back</b>',
          cube: { parts: ['Front', 'The Dance', 'Front back'] },
        },
        {
          title: 'L',
          text: 'Hold the L like in the picture: one arm points to the <b>back</b> and the other to the <b>left</b>. Then do:<br><b>Front – The backwards dance – Front back</b>',
          cube: { parts: ['Front', 'The backwards dance', 'Front back'] },
        },
        {
          title: 'Dot',
          text: 'Just a yellow dot in the middle? Do the <b>Line</b> algorithm. Now you get an L! Turn the top so the L sits like in the L picture, and do the <b>L</b> algorithm.',
          cube: { parts: ['The Line algorithm', 'Turn the top', 'The L algorithm'] },
        },
        {
          title: 'Your turn!',
          text: 'Make the yellow cross on your cube.',
          help: [
            ['I have a dot'],
            ['I have an L'],
            ['I have a line'],
            ['Only look at the plus sign in the middle, not the corners.'],
          ],
        },
      ],
    },
    w6: {
      title: 'The yellow top',
      short: 'Step O, part 2: the whole top yellow',
      quiz: [
        { q: 'Where do you hold the fish’s head, the yellow corner?', options: ['Bottom left', 'Top right', 'Bottom right'] },
        { q: 'Which algorithm do you do here?', options: ['Sune', 'Anti-Sune', 'T-perm'] },
        { q: 'No corner has yellow facing up. What do you do?', options: ['Sune, so you get a fish', 'T-perm', 'Start over from the beginning'] },
      ],
      steps: [
        {
          title: 'The yellow cross',
          text: 'The top has a yellow cross. The corners can look like anything.',
        },
        {
          title: 'The whole top yellow',
          text: 'Now the corners turn yellow too. Count how many corners have yellow facing <b>up</b>. Your top looks like one of these pictures.',
          diagrams: ['Fish', 'No yellow corners', 'Two yellow corners'],
        },
        {
          title: 'The fish – Sune',
          text: 'See a <b>fish</b>? One corner has yellow facing up, and the cross is the fish’s body.<br><br>Hold the fish’s head, the yellow corner, <b>bottom left</b>. Does the yellow on the front-right corner point <b>towards you</b>? Do <b>Sune</b>.',
          cube: { parts: SUNE_PARTS },
        },
        {
          title: 'The other fish – Anti-Sune',
          text: 'Hold the fish’s head bottom left, just like before. Does the yellow on the front-right corner point <b>to the right</b> instead? Then the fish is swimming the other way.<br><br>Turn the top half a turn (U2) and do <b>Anti-Sune</b>.',
          cube: { parts: ['Half a turn', 'Anti-Sune'] },
        },
        {
          title: 'No yellow corners?',
          text: 'No corner has yellow facing up? Turn the top until the front-left corner has yellow on its <b>left side</b>, like in the picture. Do Sune.<br><br>Now you have a fish!',
          cube: { parts: SUNE_PARTS },
        },
        {
          title: 'Two yellow corners?',
          text: 'Two corners have yellow facing up? Turn the top until the front-left corner has yellow pointing <b>forwards, towards you</b>, like in the picture. Do Sune.<br><br>Now you have a fish!',
          cube: { parts: SUNE_PARTS },
        },
        {
          title: 'Your turn!',
          text: 'Make the whole top yellow on your cube.',
          help: [
            ['I have a fish'],
            ['The fish is swimming the other way'],
            ['No corners have yellow facing up'],
            ['Two corners have yellow facing up'],
            ['Not sure? Do Sune and look again. Sooner or later the top turns yellow.'],
          ],
        },
      ],
    },
    w7: {
      title: 'Corners in place',
      short: 'Step P, part 1: T-perm and Y-perm',
      quiz: [
        { q: 'What are headlights?', options: ['Two corners on the same side with the same colour', 'Two yellow edges', 'A yellow dot'] },
        { q: 'Where do you hold the headlights when you do T-perm?', options: ['On the left', 'On the right', 'Facing you'] },
        { q: 'How does T-perm start?', options: ['With the Dance', 'With Sune', 'With F'] },
        { q: 'No headlights. What do you do?', options: ['Y-perm', 'T-perm from the left', 'Ua'] },
      ],
      steps: [
        {
          title: 'The whole top yellow',
          text: 'The whole top is yellow. Now the pieces on top move to their right spots. That’s the <b>P</b> in CFOP. Corners first!',
        },
        {
          title: 'Headlights',
          text: 'Look at the sides of the top layer. Do two corners on the same side have <b>the same colour</b>? Those are called <b>headlights</b>, like the lights on a car.<br><br>Here the headlights are blinking on the left side.',
          diagram: { label: 'Headlights on the left' },
        },
        {
          title: 'T-perm',
          text: 'Hold the headlights on the <b>left</b> and do <b>T-perm</b>. It has three parts, and it starts with the Dance!<br><br>The arrows in the picture show which pieces swap places.',
          rule: 'Headlights on the left.',
          cube: { parts: TPERM_PARTS },
        },
        {
          title: 'No headlights?',
          text: 'Can’t find any headlights at all? Then two corners need to swap places <b>diagonally</b>. Do <b>Y-perm</b> from any side. It has three parts too, and the Dance comes in the middle!',
          rule: 'Can’t remember Y-perm? Do T-perm, and you’ll get headlights.',
          cube: { parts: YPERM_PARTS },
        },
        {
          title: 'Turn the top into place',
          text: 'When all four corners have headlights: turn the top until the corners match the sides.',
        },
        {
          title: 'Your turn!',
          text: 'Put the corners in place on your cube.',
          help: [
            ['I don’t know what headlights are'],
            ['I have headlights'],
            ['I have no headlights'],
            ['All corners have headlights, but they don’t match'],
          ],
        },
      ],
    },
    w8: {
      title: 'Edges in place',
      short: 'Step P, part 2: cube solved!',
      quiz: [
        { q: 'Where do you hold the finished side?', options: ['At the back', 'Facing you', 'On the left'] },
        { q: 'No side is finished. What do you do?', options: ['Ua from any side', 'T-perm', 'Sune'] },
        { q: 'You did Ua, but it should have been Ub. What now?', options: ['Ua one more time', 'Start over from the beginning', 'Turn the top'] },
      ],
      steps: [
        {
          title: 'The corners are in place',
          text: 'All the corners on top match the sides. Only the edges are left. The very last bit!',
        },
        {
          title: 'Find the finished side',
          text: 'Find a side where the <b>whole top row</b> is one colour. Hold that side at the <b>back</b>.<br><br>The arrows show which way the other edges need to spin. That tells you whether to do Ua or Ub.',
        },
        {
          title: 'Ua',
          text: 'The edges spin like the arrows in the picture. The finished side is at the back.',
          rule: 'Finished side at the back.',
          cube: { parts: U_PARTS },
        },
        {
          title: 'Ub',
          text: 'The edges spin <b>the other way</b>.',
          rule: 'Guessed wrong? No problem! Ua twice is the same as Ub.',
          cube: { parts: U_PARTS },
        },
        {
          title: 'No finished side?',
          text: 'No side finished? Do <b>Ua</b> from any side. Then one side gets finished, and you carry on as usual.<br><br>There are also two shortcuts for these cases, <b>H</b> and <b>Z</b>. You’ll find them under Practice.',
          cube: { parts: ['Ua from any side'] },
        },
        {
          title: 'You can solve the cube!',
          text: 'Mix up your cube and solve it from start to finish: daisy, cross, corners, middle, yellow cross, yellow top, corners and edges.<br><br>You’ve learned CFOP!',
          help: [
            ['I can’t find a finished side'],
            ['The edges need to spin like Ua'],
            ['The edges need to spin like Ub'],
            ['Wrong way? Do the same algorithm one more time. Ua twice is the same as Ub.'],
          ],
        },
      ],
    },
    w9: {
      title: 'Bonus: Real F2L',
      short: 'Corner and edge together, like the pros',
      quiz: [
        { q: 'What is a pair?', options: ['A white corner and its edge', 'Two corners', 'Two centres'] },
        { q: 'Which algorithm fits here?' },
        { q: 'The white on the corner points up. What do you do first?', options: ['Turn the corner so the white points to the side', 'Put the pair in straight away', 'Do Sune'] },
      ],
      steps: [
        {
          title: 'Faster: pairs!',
          text: 'The pros don’t do the corners and the middle edges separately. They join a white corner and its edge into a <b>pair</b> and slot both in at once.<br><br>Here are the most common cases. The corner is always top right, at the front. Solve the cross as usual first.',
        },
        {
          title: 'White to the right, edge at the back',
          text: 'The corner has white to the <b>right</b>. The edge is at the very <b>back</b> of the top. Do <b>R U R\'</b>. The corner picks up the edge on its way down!',
        },
        {
          title: 'White to the front, edge on the left',
          text: 'The mirror image: the corner has white to the <b>front</b>, and the edge is on the <b>left</b>. Do <b>F\' U\' F</b>.',
        },
        {
          title: 'White to the front, edge on the right',
          text: 'The corner has white to the front, and the edge is right next to it on the <b>right</b>. Do <b>U R U\' R\'</b>.',
        },
        {
          title: 'White to the right, edge at the front',
          text: 'The corner has white to the right, and the edge is <b>in front</b>. Do <b>U\' F\' U F</b>.',
        },
        {
          title: 'Six more cases',
          text: 'Often the corner and the edge are <b>apart</b>, or the white points <b>up</b>. Then we do it in two parts:<br>1. <b>Build the pair</b>: bring the corner and the edge together.<br>2. <b>Slot the pair in</b>.<br><br>The corner is still top right, at the front.',
          rule: 'Build the pair first, then slot it in.',
        },
        {
          title: 'White to the front, edge at the back',
          text: 'The corner has white to the <b>front</b>. The edge is at the very <b>back</b> of the top. They’re apart, so we build a pair first.',
          cube: { parts: ['Build the pair', 'Slot the pair in'] },
        },
        {
          title: 'White to the right, edge on the left',
          text: 'The mirror image: the corner has white <b>to the right</b>, and the edge is on the <b>left</b>. Same idea, but with the front side.',
          cube: { parts: ['Build the pair', 'Slot the pair in'] },
        },
        {
          title: 'White to the front, edge flipped',
          text: 'The corner has white to the <b>front</b>, and the edge is on the <b>left</b>, just like in F\' U\' F. But the edge is flipped the other way: its <b>green</b> colour points up.',
          cube: { parts: ['Build the pair', 'Slot the pair in'] },
        },
        {
          title: 'White to the right, edge flipped',
          text: 'The corner has white <b>to the right</b>, and the edge is at the very <b>back</b>, just like in R U R\'. But the edge is flipped: its <b>orange</b> colour points up.',
          cube: { parts: ['Build the pair', 'Slot the pair in'] },
        },
        {
          title: 'White up, edge on the right',
          text: 'The white on the corner points <b>up</b>. The edge is right next to it on the <b>right</b>.<br><br>First turn the corner with R U2 R\'. Now the white points to the side, and the pair can be slotted in.',
          rule: 'White facing up? Turn the corner first, so the white points to the side.',
          cube: { parts: ['Turn the corner', 'Slot the pair in'] },
        },
        {
          title: 'White up, edge at the front',
          text: 'The mirror image: the white points <b>up</b>, and the edge is <b>in front</b>. Turn the corner with F\' U2 F and slot the pair in.',
          rule: 'White facing up? Turn the corner first, so the white points to the side.',
          cube: { parts: ['Turn the corner', 'Slot the pair in'] },
        },
        {
          title: 'Your turn!',
          text: 'Try solving the first two layers with pairs instead of step by step. It feels hard at first, but it gets fast!',
          help: [
            ['White to the right, edge at the back'],
            ['White to the front, edge on the left'],
            ['White to the front, edge on the right'],
            ['White to the right, edge at the front'],
            ['The corner and the edge are apart'],
            ['The edge is in the right place but flipped'],
            ['The white points up'],
            ['Don’t recognise it? Turn the top and look again. It often turns into one of the cases.'],
          ],
        },
      ],
    },
  },

  cases: {
    mid_right: 'To the right',
    mid_left: 'To the left',
    oll_line: 'Line',
    oll_l: 'L',
    oll_dot: 'Dot',
    oll_h: 'H (bonus)',
    oll_pi: 'Pi (bonus)',
    oll_u: 'Headlights (bonus)',
    oll_t: 'T (bonus)',
    oll_bowtie: 'Bowtie (bonus)',
    f2l_5: 'White to the front, edge at the back',
    f2l_6: 'White to the right, edge on the left',
    f2l_7: 'White to the front, edge flipped',
    f2l_8: 'White to the right, edge flipped',
    f2l_9: 'White up, edge on the right',
    f2l_10: 'White up, edge at the front',
    beg_corner: 'White corner: the Dance',
    beg_edges: 'Yellow edges (Sune)',
    beg_cpos: 'Yellow corners in place',
    beg_twist: 'Twist the corners',
  },

  groups: {
    cross: { title: 'The yellow cross', short: 'Yellow edges on top' },
    f2l: { title: 'F2L pairs', short: 'Corner and edge together' },
    f2l2: { title: 'More F2L pairs', short: 'Apart, flipped edges and white facing up' },
    corners: { title: 'The white corners', short: 'Dance until the corner is in' },
    mid: { title: 'The middle layer', short: 'Edges to the right and left' },
    edges: { title: 'The yellow edges', short: 'Sune moves the edges' },
    cpos: { title: 'Yellow corners in place', short: 'Right corner at the front right' },
    twist: { title: 'Twist the corners', short: "R' D' R D until yellow is up" },
    pllc: { title: 'Corners in place', short: 'T-perm and Y-perm' },
  },

  methods: {
    beg: { title: 'Beginner method', short: 'The basics, layer by layer' },
    lite: {
      title: 'Beginner method with F2L', short: 'F2L pairs and the easiest OLL and PLL cases',
      groups: { oll: { title: 'The yellow top', short: 'Sune and Anti-Sune' }, plle: { title: 'Edges in place', short: 'Ua and Ub' } },
    },
    cfop: {
      title: '2-Look CFOP', short: 'F2L pairs, full 2-look OLL and PLL',
      groups: { oll: { title: 'The yellow top', short: 'All seven corner cases' }, plle: { title: 'Edges in place', short: 'Ua, Ub, H and Z' } },
    },
  },
};
