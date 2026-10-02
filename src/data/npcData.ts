import { NpcCharacter } from '../types/npc';

export const INITIAL_NPCS: NpcCharacter[] = [
  // ===================== KINGS & MONARCHS =====================
  {
    id: 'king_soul_reio',
    name: 'Король Душ (Рейо)',
    title: 'Божественный Суверен Трёх Миров, Опора Реальности',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    isKing: true,
    category: 'king',
    homeSystemId: 'soul_society_seireitei',
    locationName: 'Дворец Короля Душ (Рейокию)',
    avatarEmoji: '👑',
    themeColor: '#38BDF8',
    quote: 'Баланс душ между миром живых и сумеречным измерением незыблем. Мой взор пронзает ткань бесконечности.',
    backstory: 'Древнейшее божественное существо, стоящее во главе всего мироздания Bleach. Его духовная сила (Реяцу) скрепляет Сообщество Душ, Мир Живых и Уэко Мундо, не давая космосу схлопнуться в хаос.',
    greeting: 'Смертный путешественник... Твой звёздный корабль пересёк границу миров. Чего ищет твоя душа в священных чертогах Рейокию?',
    royalDecree: {
      title: 'Королевский Указ: «Священная Гармония Трёх Миров»',
      description: 'Божественное благословение Короля Душ наполняет реакторы судна чистейшей эфирной субстанцией Рейши.',
      bonusSummary: '+40 Антиматерии, +150 Науки, +800 Кредитов',
      claimed: false,
      reward: {
        antimatter: 40,
        science: 150,
        credits: 800,
        xp: 350
      }
    },
    dialogueOptions: [
      {
        id: 'soul_king_blessing',
        label: 'Испросить благословение Короля Душ на дальний поход',
        response: 'Король Душ возложил незримую длань на навигационную матрицу вашего судна. Ваши щиты озарились бирюзовым пламенем Рейши (+100 Науки, +15 Антиматерии)!',
        reward: {
          science: 100,
          antimatter: 15,
          xp: 150
        },
        oneTimeOnly: true,
        actionType: 'blessing'
      },
      {
        id: 'soul_king_lore',
        label: 'Спросить о тайне стен Сэккисэки и Готей 13',
        response: 'Стены Сэккисэки созданы из редчайшей породы, отражающей любые духовные волны. А тринадцать отрядов Синигами — лишь щит и карающий меч против тех, кто посмеет осквернить порядок круговорота душ.'
      }
    ],
    quests: [
      {
        id: 'quest_soul_reishi',
        title: 'Стабилизация Духовного Разлома',
        description: 'Предоставьте 30 единиц антиматерии для подпитки печати Дангай между мирами.',
        giverId: 'king_soul_reio',
        giverName: 'Король Душ',
        targetValueText: 'Накопить 30+ ед. Антиматерии',
        rewardText: '+1500 ⬡, +50 Антиматерии, +300 XP',
        requirementType: 'antimatter',
        targetValue: 30,
        reward: {
          credits: 1500,
          antimatter: 50,
          xp: 300
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'king_guru_namek',
    name: 'Великий Старейшина Гуру',
    title: 'Патриарх и Король Народа Намекианцев, Творец Жемчужин',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Намек',
    isKing: true,
    category: 'guru',
    homeSystemId: 'namek',
    locationName: 'Святилище Старейшины Гуру',
    avatarEmoji: '✨',
    themeColor: '#34D399',
    quote: 'Сила духа не знает пределов, если сердце чисто. Я вижу в твоей душе великий огонь странника звёзд.',
    backstory: 'Мудрейший правитель и отец всех ныне живущих намекианцев. Создатель семи гигантских Жемчужин Дракона Намека, способный силой мысли пробуждать спящий потенциал любого живого существа во Вселенной.',
    greeting: 'Мир тебе, звёздный скиталец. Наша планета Намек купается в лучах трёх вечных солнц. Присядь рядом, и позволь мне заглянуть в глубины твоей сущности...',
    royalDecree: {
      title: 'Великое Пробуждение Потенциала Старейшины',
      description: 'Гуру возлагает ладонь на ваш лоб: скрытые резервы командира и экипажа высвобождаются, а корпус судна наполняется жизненной энергией Ки!',
      bonusSummary: '+400 XP Командиру, 100% Ремонт Корпуса, +3 Бобы Сэндзу',
      claimed: false,
      reward: {
        xp: 400,
        repairHullPercent: 100,
        credits: 500,
        food: 50
      }
    },
    dialogueOptions: [
      {
        id: 'guru_awakening',
        label: 'Попросить пробудить скрытые силы разума и тактики',
        response: 'Тепло Ки разливается по вашим венам! Ваши реакции обострились, а тактическое зрение командира возросло на порядок (+250 XP, +30 сплавов на укрепление брони)!',
        reward: {
          xp: 250,
          alloys: 30
        },
        oneTimeOnly: true,
        actionType: 'awakening'
      },
      {
        id: 'guru_dragon_balls',
        label: 'Расспросить о Драконе Порунга и Жемчужинах',
        response: 'Порунга — Дракон Мечты на языке намекианцев. Он исполняет не одно, а целых три желания! Но помни: жадность разрушает гармонию, а истинная сила кроется в защите слабых.'
      }
    ],
    quests: [
      {
        id: 'quest_guru_ajissa',
        title: 'Возрождение Рощ Аджисса',
        description: 'Привезите 40 сплавов и 50 продовольствия для возведения защитных террас вокруг священных рощ Аджисса.',
        giverId: 'king_guru_namek',
        giverName: 'Великий Старейшина Гуру',
        targetValueText: 'Иметь 40+ сплавов в запасе',
        rewardText: '+1200 ⬡, +350 XP, +60 Продовольствия',
        requirementType: 'alloys',
        targetValue: 40,
        reward: {
          credits: 1200,
          food: 60,
          xp: 350
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'king_emperor_lucius',
    name: 'Император Люциус III Валуа',
    title: 'Верховный Монарх Солнечной Метрополии и Протекторатов ОФЗ',
    universe: 'galaxy',
    universeName: 'Astraea: Солнечная Система',
    isKing: true,
    category: 'emperor',
    factionId: 'terran',
    homeSystemId: 'sol',
    locationName: 'Императорский Дворец Земли',
    avatarEmoji: '🏛️',
    themeColor: '#38BDF8',
    quote: 'Человечество не просто выживает среди звёзд — оно строит несокрушимую цивилизацию закона, прогресса и порядка.',
    backstory: 'Потомственный правитель объединённых колоний Земли, Марса и Пояса Койпера. Под его властью флот Федерации расширил границы до самых далёких рубежей галактики.',
    greeting: 'Приветствую, капитан экспедиционного флота. Доклады разведки подтверждают ваши выдающиеся заслуги перед короной и Федерацией. Что привело вас на Земную аудиенцию?',
    royalDecree: {
      title: 'Императорская Грамота на Освоение Внешних Рубежей',
      description: 'Официальный эдикт Монарха ОФЗ, выделяющий субсидии из имперской казны для развития отдалённых звёздных баз.',
      bonusSummary: '+1000 ⬡ Кредитов, +80 Сверхпрочных Сплавов, +50 Науки',
      claimed: false,
      reward: {
        credits: 1000,
        alloys: 80,
        science: 50,
        xp: 200
      }
    },
    dialogueOptions: [
      {
        id: 'emperor_grant',
        label: 'Запросить имперскую субсидию на модернизацию систем',
        response: 'Император утвердил печатью указ о перечислении 600 кредитов на баланс вашего флагмана!',
        reward: {
          credits: 600
        },
        oneTimeOnly: true,
        actionType: 'decree'
      },
      {
        id: 'emperor_politics',
        label: 'Спросить о планах Федерации насчёт Синдиката',
        response: 'Корсары Синдиката — заноза в боку галактической торговли. Но пока они держатся границ Завесы, мы ведём с ними осторожную шахматную партию.'
      }
    ],
    quests: [
      {
        id: 'quest_emperor_colonists',
        title: 'Колониальный Призыв Метрополии',
        description: 'Обеспечьте флот запасом поселенцев для основания новых колониальных форпостов (не менее 30 колонистов).',
        giverId: 'king_emperor_lucius',
        giverName: 'Император Люциус III',
        targetValueText: 'Собрать 30+ поселенцев на борту',
        rewardText: '+1800 ⬡, +100 Сплавов, +300 XP',
        requirementType: 'colonists',
        targetValue: 30,
        reward: {
          credits: 1800,
          alloys: 100,
          xp: 300
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'king_corsair_malakai',
    name: 'Малахай «Чёрный Вихрь»',
    title: 'Теневой Король Корсаров, Владыка Пиратского Престола',
    universe: 'galaxy',
    universeName: 'Astraea: Завеса Веила',
    isKing: true,
    category: 'king',
    factionId: 'syndicate',
    homeSystemId: 'veil_nebula',
    locationName: 'Цитадель Синдиката "Тортуга-4"',
    avatarEmoji: '☠️',
    themeColor: '#F59E0B',
    quote: 'Законы пишут слабаки в шёлковых мантиях на Земле. В варпе правит тот, у кого мощнее пушки и смелее экипаж!',
    backstory: 'Легендарный пиратский адмирал, объединивший разрозненные банды наёмников и корсаров в могущественный Синдикат Свободных Звёзд.',
    greeting: 'Ха! Смотрите, кто прилетел в моё логово! Ты либо безумец, либо самый отчаянный капитан в этом секторе. Выкладывай, чего хочешь, пока мои парни не разобрали твой корабль на болты!',
    royalDecree: {
      title: 'Каперский Патент Чёрного Флага',
      description: 'Теневой Король выдаёт вам тайный мандат на охоту за конвоями ОФЗ и дарует тяжёлый термоядерный боезапас.',
      bonusSummary: '+2 Термоядерные Боеголовки (Ядерки), +750 ⬡, +250 XP',
      claimed: false,
      reward: {
        nukes: 2,
        credits: 750,
        xp: 250
      }
    },
    dialogueOptions: [
      {
        id: 'corsair_bribe',
        label: 'Предложить совместную операцию по сбыту ценностей',
        response: 'Малахай оценивающе ухмыляется и хлопает вас по плечу: "Мне нравится твоя наглость, салага! Держи долю с недавнего захвата конвоя (+850 кредитов)!"',
        reward: {
          credits: 850,
          xp: 150
        },
        oneTimeOnly: true,
        actionType: 'bounty'
      },
      {
        id: 'corsair_secret',
        label: 'Узнать координаты тайных схронов в туманности',
        response: 'Слушай сюда: в глубоких облаках Завесы есть скрытые обломки линкора "Цербер". Кто рискнёт сунуться — озолотится на антиматерии.'
      }
    ],
    quests: [
      {
        id: 'quest_corsair_nukes',
        title: 'Арсенал Судного Дня',
        description: 'Докажите силу своего судна: запаситесь не менее чем 3 ядерными зарядами для решающего рейда.',
        giverId: 'king_corsair_malakai',
        giverName: 'Малахай Чёрный Вихрь',
        targetValueText: 'Иметь 3+ ядерных боеголовок',
        rewardText: '+2200 ⬡, +2 Боеголовки, +400 XP',
        requirementType: 'nukes',
        targetValue: 3,
        reward: {
          credits: 2200,
          nukes: 2,
          xp: 400
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'king_miner_thorgrim',
    name: 'Торгрим «Железный Кулак»',
    title: 'Король Шахтёрских Недр, Верховный Глава Горных Гильдий',
    universe: 'galaxy',
    universeName: 'Astraea: Система Сириус',
    isKing: true,
    category: 'king',
    factionId: 'miners',
    homeSystemId: 'sirius',
    locationName: 'Литейная Цитадель Сириуса',
    avatarEmoji: '⛏️',
    themeColor: '#10B981',
    quote: 'Звёзды холодны, но наше литейное пламя согреет любую колонию. Металл — это кровь и плоть цивилизации.',
    backstory: 'Суровый ветеран астероидных карьеров, прошедший путь от простого бурильщика до единоличного предводителя независимого Шахтёрского Профсоюза.',
    greeting: 'Здорово, пилот! Руки в масле, лицо в копоти — вот истинная цена каждого куска титана на твоём корпусе. За чем пожаловал к Горнякам?',
    royalDecree: {
      title: 'Сертификат Гильдии Старателей Высшего Разряда',
      description: 'Король Торгрим открывает для вас доступ к закрытым складам редких сплавов и энергоносителей.',
      bonusSummary: '+120 Титановых Сплавов, +60 Канистр Гелия-3, +600 ⬡',
      claimed: false,
      reward: {
        alloys: 120,
        credits: 600,
        xp: 200
      }
    },
    dialogueOptions: [
      {
        id: 'miner_alloys_gift',
        label: 'Попросить партию укреплённых композитных плит',
        response: 'Торгрим стучит молотом по наковальне: "Забирай, капитан! Сделано на совесть — выдержит попадание любой рейлганной пули (+75 сплавов)!"',
        reward: {
          alloys: 75
        },
        oneTimeOnly: true,
        actionType: 'decree'
      }
    ],
    quests: [
      {
        id: 'quest_miner_credits',
        title: 'Инвестиции в Новые Буровые Платформы',
        description: 'Накопите не менее 2000 кредитов для финансирования глубокого астероидного карьера на Гефесте.',
        giverId: 'king_miner_thorgrim',
        giverName: 'Торгрим Железный Кулак',
        targetValueText: 'Накопить 2000+ ⬡ Кредитов',
        rewardText: '+150 Сплавов, +800 ⬡, +300 XP',
        requirementType: 'credits',
        targetValue: 2000,
        reward: {
          credits: 800,
          alloys: 150,
          xp: 300
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'king_oracle_celestia',
    name: 'Звёздная Королева-Оракул Селестия',
    title: 'Верховная Архивариус и Королева Врат Предтеч',
    universe: 'galaxy',
    universeName: 'Astraea: Пульсар & Врата',
    isKing: true,
    category: 'oracle',
    factionId: 'precursors',
    homeSystemId: 'pulsar_psr',
    locationName: 'Уловитель Антиматерии "Тесла"',
    avatarEmoji: '🔮',
    themeColor: '#C084FC',
    quote: 'Время — это спираль. Зодчие оставили нам ключи к тайнам мироздания, и врата распахнутся лишь достойным.',
    backstory: 'Таинственная правительница техномистиков Конкорда, посвятившая жизнь расшифровке сигналов сверхмассивных черных дыр и реликвий Предтеч.',
    greeting: 'Я слышала шёпот твоего субпространственного следа задолго до того, как твой корабль вышел из гиперпрыжка. Какую тайну ты хочешь раскрыть?',
    royalDecree: {
      title: 'Эдикт Оракула: «Симфония Вечности Зодчих»',
      description: 'Селестия делится древними архивами Зодчих, трансформируя энергетические контуры вашего судна.',
      bonusSummary: '+180 Научных Данных, +35 Антиматерии, +300 XP',
      claimed: false,
      reward: {
        science: 180,
        antimatter: 35,
        xp: 300
      }
    },
    dialogueOptions: [
      {
        id: 'oracle_vision',
        label: 'Испросить видение о Вратах Бездны «Астрея»',
        response: 'Оракул протягивает кристалл: "Врата оживут лишь когда антиматерия наполнит все три квантовых накопителя. Ты держишь в руках ключ к центру галактики (+120 Науки)!"',
        reward: {
          science: 120
        },
        oneTimeOnly: true,
        actionType: 'blessing'
      }
    ],
    quests: [
      {
        id: 'quest_oracle_science',
        title: 'Великий Сбор Научных Данных',
        description: 'Соберите не менее 120 единиц научных данных со сканеров аномалий и планет.',
        giverId: 'king_oracle_celestia',
        giverName: 'Королева-Оракул Селестия',
        targetValueText: 'Собрать 120+ Научных данных',
        rewardText: '+45 Антиматерии, +1400 ⬡, +350 XP',
        requirementType: 'science',
        targetValue: 120,
        reward: {
          credits: 1400,
          antimatter: 45,
          xp: 350
        },
        completed: false,
        claimed: false
      }
    ]
  },

  // ===================== FAMOUS NPCS =====================
  {
    id: 'npc_yamamoto',
    name: 'Главнокомандующий Ямамото Генрюсай',
    title: 'Капитан 1-го Отряда, Абсолютный Меч Готей 13',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    isKing: false,
    category: 'shinigami',
    homeSystemId: 'soul_society_seireitei',
    locationName: 'Штаб 1-го Отряда Сэйрэйтэй',
    avatarEmoji: '🔥',
    themeColor: '#EF4444',
    quote: 'Справедливость не знает компромиссов. Мой клинок обратит в пепел любое зло, угрожающее покою Сообщества Душ!',
    backstory: 'Древнейший и могущественнейший Синигами в истории Сообщества Душ, основатель Академии духовных искусств и бессменный лидер 13 отрядов на протяжении тысячелетия.',
    greeting: 'Стой, чужак. Ты стоишь перед лицом Главнокомандующего Готей 13. Любое нарушение законов Сообщества Душ карается на месте. С чем ты предстал передо мной?',
    dialogueOptions: [
      {
        id: 'yamamoto_ryujin',
        label: 'Спросить о пламени Рюдзин Дзякка',
        response: 'Старец слегка приоткрывает плащ — волна жара ослепляет сенсоры: "Мой клинок способен испепелить всё сущее до мельчайшей частицы. Будь осторожен со своими амбициями, капитан."'
      },
      {
        id: 'yamamoto_tactics',
        label: 'Попросить тактического наставления по ведению боя',
        response: 'Ямамото кивает с суровым одобрением: "Не колеблись, нанося удар. Слабость сердца в бою — верная гибель!" (+200 XP Командиру, +1 ядерная боеголовка на крайний случай)!',
        reward: {
          xp: 200,
          nukes: 1
        },
        oneTimeOnly: true,
        actionType: 'awakening'
      }
    ],
    quests: [
      {
        id: 'quest_yamamoto_readiness',
        title: 'Военная Готовность к Битве',
        description: 'Докажите боеспособность вашего флагмана: накопите не менее 150 сплавов для брони и запас ядерного оружия.',
        giverId: 'npc_yamamoto',
        giverName: 'Главнокомандующий Ямамото',
        targetValueText: 'Собрать 150+ Сплавов',
        rewardText: '+2000 ⬡, +2 Боеголовки, +500 XP',
        requirementType: 'alloys',
        targetValue: 150,
        reward: {
          credits: 2000,
          nukes: 2,
          xp: 500
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'npc_bulma',
    name: 'Бульма Брифинг',
    title: 'Главный Научный Гений Capsule Corporation',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Намек',
    isKing: false,
    category: 'scientist',
    homeSystemId: 'namek',
    locationName: 'Исследовательский Лагерь Намека',
    avatarEmoji: '🔬',
    themeColor: '#06B6D4',
    quote: 'Если что-то невозможно изобрести — просто дайте мне чашку кофе и пятнадцать минут!',
    backstory: 'Гениальная ученая, наследница Capsule Corporation. Создала Драконий Радар, капсульные технологии миниатюризации и субсветовые звездолёты для путешествия на Намек.',
    greeting: 'Привет-привет! Ничего себе у тебя звездолёт! Хотя сенсорную матрицу можно было бы настроить и получше... Хочешь, я покопаюсь в твоём бортовом компьютере?',
    dialogueOptions: [
      {
        id: 'bulma_upgrade_radar',
        label: 'Попросить оптимизировать квантовые сканеры корабля',
        response: 'Бульма ловко перепаивает пару микросхем: "Готово! Теперь твои сенсоры улавливают гравитационные аномалии вдвое дальше!" (+80 Науки, +300 кредитов)!',
        reward: {
          science: 80,
          credits: 300,
          xp: 150
        },
        oneTimeOnly: true,
        actionType: 'trade'
      },
      {
        id: 'bulma_capsules',
        label: 'Расспросить о капсульных технологиях сжатия материи',
        response: 'Всё просто: мы сжимаем пространственно-временную метрику внутри карманной капсулы Хой-Пой. Так можно уместить целый дом в кармане!'
      }
    ],
    quests: [
      {
        id: 'quest_bulma_science',
        title: 'Калибровка Драконьего Радара',
        description: 'Предоставьте данные сканирования аномалий (необходимо иметь не менее 60 очков науки).',
        giverId: 'npc_bulma',
        giverName: 'Бульма (Capsule Corp)',
        targetValueText: 'Накопить 60+ Науки',
        rewardText: '+1100 ⬡, +80 Сплавов, +250 XP',
        requirementType: 'science',
        targetValue: 60,
        reward: {
          credits: 1100,
          alloys: 80,
          xp: 250
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'npc_urahara',
    name: 'Урахара Киске',
    title: 'Тайный Торговец и Экс-Капитан 12-го Отряда',
    universe: 'bleach',
    universeName: 'Bleach: Руконгай',
    isKing: false,
    category: 'trader',
    homeSystemId: 'soul_society_senkaimon',
    locationName: 'Тайная Лавка Урахары у Врат Сэнкаймон',
    avatarEmoji: '👒',
    themeColor: '#10B981',
    quote: 'Тот, кто думает только о победе, никогда не поймёт истинную суть науки и превратностей судьбы.',
    backstory: 'Загадочный интеллектуал в полосатой панаме и гэта. Создатель Сферы Хогиоку, изгнанный гений и непревзойдённый стратег, знающий тайны всех миров.',
    greeting: 'Оя-оя! Кажется, ко мне в лавку заглянул любопытный звёздный капитан... Не желаете взглянуть на редкие духовные диковинки или обменяться ценными слухами?',
    dialogueOptions: [
      {
        id: 'urahara_hogyoku_hint',
        label: 'Спросить о легендарной Сфере Хогиоку',
        response: 'Урахара хитро прикрывает лицо веером: "Хогиоку? Опасная игрушка, капитан... Она не просто даёт силу — она материализует то, о чём ваше подсознание даже боится мечтать."'
      },
      {
        id: 'urahara_secret_stash',
        label: 'Купить тайные координаты схрона в Дангай (200 ⬡)',
        response: 'Урахара с улыбкой берёт плату: "Благодарю за покупку! Держите зашифрованный диск с антиматерией (+25 ед. антиматерии, +100 науки)!"',
        cost: {
          credits: 200
        },
        reward: {
          antimatter: 25,
          science: 100
        },
        oneTimeOnly: true,
        actionType: 'trade'
      }
    ],
    quests: [
      {
        id: 'quest_urahara_reishi_deal',
        title: 'Секретный Контракт Урахары',
        description: 'Принесите не менее 1500 кредитов для участия в закрытом аукционе духовных реликвий.',
        giverId: 'npc_urahara',
        giverName: 'Урахара Киске',
        targetValueText: 'Накопить 1500+ ⬡',
        rewardText: '+30 Антиматерии, +70 Сплавов, +300 XP',
        requirementType: 'credits',
        targetValue: 1500,
        reward: {
          credits: 500,
          antimatter: 30,
          alloys: 70,
          xp: 300
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'npc_kenpachi',
    name: 'Зараки Кенпачи',
    title: 'Капитан 11-го Отряда, Бессмертный Демон Меча',
    universe: 'bleach',
    universeName: 'Bleach: Руконгай (Зараки)',
    isKing: false,
    category: 'warrior',
    homeSystemId: 'soul_society_senkaimon',
    locationName: 'Поселения Руконгая: Район Зараки',
    avatarEmoji: '⚔️',
    themeColor: '#EA580C',
    quote: 'Смысл жизни — в достойной драке! Если враг не заставляет твоё сердце биться быстрее, зачем вообще обнажать клинок?!',
    backstory: 'Неукротимый боец из самого дикого 80-го района Руконгая. Не пользуется кидо и защитными чарами, побеждая противников чистейшей дикой силой и жаждой сражения.',
    greeting: 'Эй ты! Твой корабль выглядит крепким! Надеюсь, у тебя на борту есть тяжёлые пушки, иначе нам не о чем разговаривать!',
    dialogueOptions: [
      {
        id: 'kenpachi_sparring',
        label: 'Принять боевой вызов Кенпачи на тактическом тренажёре',
        response: 'Кенпачи громко хохочет, отражая выстрелы ваших лазеров в тренировочном симуляторе: "Неплохо, сопляк! Ты умеешь держать удар!" Ваш экипаж закалён в битве (+300 XP Командиру, +50 сплавов)!',
        reward: {
          xp: 300,
          alloys: 50
        },
        oneTimeOnly: true,
        actionType: 'awakening'
      }
    ],
    quests: [
      {
        id: 'quest_kenpachi_weapons',
        title: 'Ультимативная Огневая Мощь',
        description: 'Зарядите реакторы корабля: имейте на складе боеголовки или покажите 100+ сплавов.',
        giverId: 'npc_kenpachi',
        giverName: 'Зараки Кенпачи',
        targetValueText: 'Собрать 100+ сплавов',
        rewardText: '+1600 ⬡, +1 Ядерка, +400 XP',
        requirementType: 'alloys',
        targetValue: 100,
        reward: {
          credits: 1600,
          nukes: 1,
          xp: 400
        },
        completed: false,
        claimed: false
      }
    ]
  },
  {
    id: 'npc_dende',
    name: 'Денде',
    title: 'Юный Намекианский Целитель',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Намек',
    isKing: false,
    category: 'guru',
    homeSystemId: 'namek',
    locationName: 'Планета Намек: Деревня Мори',
    avatarEmoji: '🌱',
    themeColor: '#84CC16',
    quote: 'Пожалуйста, не воюйте... Намек всегда открыт для тех, кто приходит с миром в сердце.',
    backstory: 'Добрый намекианский юноша, спасённый от набегов захватчиков. Обладает врождённым священным даром исцеления любых ран и регенерации материи.',
    greeting: 'Здравствуйте! Вы прилетели издалека? Если ваш корабль повреждён в боях, я могу залечить раны обшивки своей целительной Ки!',
    dialogueOptions: [
      {
        id: 'dende_heal_ship',
        label: 'Попросить Денде исцелить повреждения корабля (Бесплатно)',
        response: 'Денде возложил маленькие ладони на переборки шлюза: зелёное сияние Ки мгновенно затягивает все пробоины корпуса! (Корпус восстановлен до 100%!)',
        reward: {
          repairHullPercent: 100
        },
        actionType: 'repair'
      },
      {
        id: 'dende_namek_tea',
        label: 'Выпить освежающей чистой воды Намека вместе с Денде',
        response: 'Кристальная вода Намека наполняет бодростью! Экипаж чувствует необычайный прилив сил (+30 Продовольствия, +50 XP)!'
      }
    ],
    quests: [
      {
        id: 'quest_dende_peace',
        title: 'Гуманитарная Миссия Намека',
        description: 'Привезите 40 единиц продовольствия для пострадавших от метеоритов деревень Намека.',
        giverId: 'npc_dende',
        giverName: 'Денде',
        targetValueText: 'Иметь 40+ продовольствия',
        rewardText: '+800 ⬡, Полный ремонт, +200 XP',
        requirementType: 'colonists',
        targetValue: 20,
        reward: {
          credits: 800,
          repairHullPercent: 100,
          xp: 200
        },
        completed: false,
        claimed: false
      }
    ]
  }
];
