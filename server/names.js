function nameModule() {
  var adjectives = ['abandoned', 'abnormal', 'able', 'average', 'absurd', 'acceptable', 'adorable', 'alcoholic',
    'angry', 'attractive', 'bad', 'beautiful', 'bitter', 'bizarre', 'bored', 'brave', 'busy', 'calm', 'careful',
    'caring', 'cheerful', 'clever', 'clumsy', 'creepy', 'curious', 'cute', 'damaged', 'depressed', 'diligent',
    'dirty', 'drunk', 'easy', 'elderly', 'entertaining', 'eager', 'fast', 'flaky', 'fluffy', 'forgetful', 'fragile',
    'funny', 'gaudy', 'glib', 'good', 'greedy', 'grumpy', 'groovy', 'healthy', 'hungry', 'high', 'happy', 'harmonious',
    'helpful', 'icky', 'illegal', 'imaginary', 'incredible', 'intelligent', 'jealous', 'jobless', 'juvenile', 'jumpy',
    'kind', 'lazy', 'lethal', 'lewd', 'lively', 'lonely', 'loud', 'lovely', 'lying', 'magical', 'magnificent',
    'materialistic', 'meek', 'mellow', 'mysterious', 'naive', 'naughty', 'needy', 'nervous', 'normal', 'nutty',
    'obedient', 'obscene', 'outrageous', 'organic', 'open', 'peaceful', 'perfect', 'plastic', 'powerful', 'polite',
    'pumped', 'quick', 'quaint', 'quirky', 'rare', 'rebel', 'reflective', 'remarkable', 'responsible', 'robust',
    'rude', 'sad', 'salty', 'scandalous', 'sacred', 'serious', 'shallow', 'simple', 'squeamish', 'smart', 'special',
    'spooky', 'strange', 'tacky', 'talented', 'tedious', 'tense', 'terrific', 'thirsty', 'troubled', 'unbiased',
    'unusual', 'upbeat', 'unique', 'unknown', 'ultra', 'wholesome', 'wild', 'witty',
    'woozy', 'xenophobic', 'young', 'zesty', 'zany'];
  var animals = ['aardvark', 'albatross', 'alligator', 'alpaca', 'anteater', 'antelope', 'ape', 'armadillo',
    'baboon', 'badger', 'barracuda', 'bat', 'bear', 'beaver', 'bee', 'bison', 'boar', 'buffalo', 'butterfly',
    'camel', 'capybara', 'caribou', 'cat', 'caterpillar', 'cattle', 'cheetah', 'chicken', 'chimpanzee', 'chinchilla',
    'clam', 'cobra', 'coyote', 'crab', 'crane', 'crocodile', 'crow', 'deer', 'dinosaur', 'dog', 'dolphin', 'donkey',
    'dove', 'duck', 'eagle', 'eel', 'elephant', 'elk', 'emu', 'falcon', 'ferret', 'fish', 'flamingo', 'fly', 'fox',
    'frog', 'gazelle', 'gerbil', 'giraffe', 'gnat', 'gnu', 'goat', 'goose', 'goldfish', 'gorilla', 'grasshopper',
    'guinea-pig', 'gull', 'hamster', 'hare', 'hawk', 'hedgehog', 'heron', 'herring', 'hippo', 'hornet', 'horse',
    'hummingbird', 'hyena', 'jackal', 'jaguar', 'jay', 'jellyfish', 'kangaroo', 'kingfisher', 'koala', 'lemur',
    'leopard', 'lion', 'llama', 'lobster', 'locust', 'magpie', 'mallard', 'manatee', 'mantis', 'meerkat', 'mink',
    'mole', 'mongoose', 'monkey', 'moose', 'mouse', 'mosquito', 'mule', 'narwhal', 'newt', 'octopus', 'opossum',
    'oryx', 'ostrich', 'otter', 'owl', 'ox', 'oyster', 'panther', 'parrot', 'pelican', 'penguin', 'pheasant',
    'pig', 'pigeon', 'polar-bear', 'pony', 'porcupine', 'porpoise', 'prairie-dog', 'quail', 'rabbit', 'raccoon',
    'rail', 'ram', 'rat', 'raven', 'reindeer', 'rhinoceros', 'salamander', 'salmon', 'sardine', 'scorpion',
    'sea-lion', 'sea-urchin', 'seahorse', 'seal', 'shark', 'sheep', 'skunk', 'snail', 'snake', 'sparrow',
    'spider', 'squid', 'squirrel', 'starling', 'stingray', 'stork', 'swallow', 'swan', 'tiger', 'toad',
    'trout', 'turkey', 'turtle', 'viper', 'wallaby', 'walrus', 'wasp', 'water-buffalo', 'weasel', 'whale',
    'wolf', 'wolverine', 'wombat', 'woodpecker', 'worm', 'yak', 'zebra'];

  // Creates a random pair of adjectives / animals
  // Does not check for repeats as of now.
  this.gen_name = function () {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const ani = animals[Math.floor(Math.random() * animals.length)];
    return adj + ' ' + ani;
  };

  // Returns a random pastel depending on the string.
  // I can try to do something different like "distinguishing from other colors"
  // Would force me to learn some color theory and math I suppose.
  var seedrandom = require('seedrandom');
  this.gen_color = function (name) {
    var rng = seedrandom(name);
    var r = (Math.round(rng() * 100) + 154).toString(16);
    var g = (Math.round(rng() * 100) + 154).toString(16);
    var b = (Math.round(rng() * 100) + 154).toString(16);
    return '#' + r + g + b;
  };
}

module.exports = nameModule;
