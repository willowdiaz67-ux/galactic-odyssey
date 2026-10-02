import { Kingdom } from '../types/kingdom';

export const INITIAL_KINGDOMS: Kingdom[] = [
  // ===================== 1. SOUL SOCIETY REALM (BLEACH) =====================
  {
    id: 'soul_society',
    name: 'Священное Королевство Душ: Сэйрэйтэй',
    shortName: 'Королевство Душ',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    monarchName: 'Король Душ (Рейо)',
    monarchTitle: 'Божественный Суверен Трёх Миров, Опора Реальности',
    monarchNpcId: 'king_soul_reio',
    capitalSystemId: 'soul_society_seireitei',
    capitalName: 'Дворец Рейокию & Цитадель Сэйрэйтэй',
    controlledSystemIds: ['soul_society_seireitei', 'soul_society_senkaimon'],
    bannerEmoji: '👑',
    bannerSymbol: '⚡⚔️',
    color: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    governmentType: 'Теократическая Духовная Монархия',
    ideology: 'Баланс Трёх Миров и Неприкосновенность Круговорота Душ',
    anthemQuote: '«Пока бьётся сердце Короля Душ в священном измерении, ткань мироздания не рухнет в пучину небытия».',
    lore: 'Древнейшее царство во всей Вселенной, управляемое Божественным Королем Душ Рейо при содействии Нулевого Отряда Королевской Стражи и 13 отрядов Готей. Здесь перерабатывается чистейший эфир Рейши, куются легендарные клинки Дзанпакто из духовной стали, а врата Сэнкаймон связывают параллельные измерения.',
    militaryPower: 145000,
    treasury: 380000,
    territorySharePercent: 28,
    reputation: 25,
    allegiance: 'friend',
    playerInvestment: 0,
    privileges: [
      {
        id: 'soul_priv_barrier',
        title: 'Духовный Барьер Сэккисэки',
        description: 'Королевские инженеры покрывают щиты корабля духовной пылью Сэккисэки, поглощающей космическую радиацию и лазерные залпы.',
        effectSummary: '+30 к максимальной ёмкости Щитов корабля',
        minReputation: 15,
        costCredits: 800,
        costScience: 120,
        unlocked: false,
        passiveBonus: {
          extraShields: 30
        }
      },
      {
        id: 'soul_priv_senkaimon',
        title: 'Печать Врат Сэнкаймон',
        description: 'Официальный пропуск через духовные коридоры Дангай: снижает расход топлива Гелия-3 на дальние варп-прыжки.',
        effectSummary: '+15 световых лет к дальности варп-двигателя',
        minReputation: 35,
        costCredits: 1500,
        costAntimatter: 25,
        unlocked: false,
        passiveBonus: {
          warpBonus: 15
        }
      },
      {
        id: 'soul_priv_reishi_tithe',
        title: 'Королевский Алхимический Десятинный Дар',
        description: 'Монаршая казна Сэйрэйтэя направляет вашему флоту очищенную субстанцию Рейши каждый экономический цикл.',
        effectSummary: 'Каждый цикл: +20 Науки и +5 Антиматерии',
        minReputation: 60,
        costCredits: 3000,
        costScience: 250,
        costAntimatter: 40,
        unlocked: false,
        passiveBonus: {
          cycleScienceYield: 20,
          cycleAntimatterYield: 5
        }
      }
    ],
    petitions: [
      {
        id: 'soul_petition_stabilize',
        title: 'Петиция о Стабилизации Духовного Разлома',
        description: 'Передайте 25 ед. Антиматерии для укрепления печатей между мирами живых и пустых.',
        requirementText: 'Требуется: 25 ед. Антиматерии',
        rewardSummary: '+1200 ⬡, +30 Репутации Королевства, +350 XP',
        cost: {
          antimatter: 25
        },
        reward: {
          credits: 1200,
          reputationGain: 30,
          xp: 350,
          science: 100
        },
        completed: false
      },
      {
        id: 'soul_petition_alloy_supply',
        title: 'Поставка Сверхпрочных Сплавов для Казарма Готей 13',
        description: 'Оружейные мастера 12-го научно-исследовательского отряда Маюри Куроцучи запрашивают 40 ед. сплавов.',
        requirementText: 'Требуется: 40 ед. Сплавов',
        rewardSummary: '+1000 ⬡, +25 Репутации, +2 Термоядерных Заряда',
        cost: {
          alloys: 40
        },
        reward: {
          credits: 1000,
          reputationGain: 25,
          xp: 250,
          nukes: 2
        },
        completed: false
      }
    ],
    titles: [
      {
        id: 'title_soul_friend',
        kingdomId: 'soul_society',
        kingdomName: 'Сообщество Душ',
        rank: 'friend',
        title: 'Поверенный Синигами',
        description: 'Признан Советом 46 благонадёжным союзником Сэйрэйтэя.',
        minReputation: 15,
        badgeEmoji: '🌸',
        color: '#38BDF8',
        bonusSummary: '+10 к Щитам, +100 ⬡ дохода за цикл',
        perk: { extraShields: 10, extraCredits: 100 }
      },
      {
        id: 'title_soul_knight',
        kingdomId: 'soul_society',
        kingdomName: 'Сообщество Душ',
        rank: 'knight',
        title: 'Офицер Готей 13',
        description: 'Почётный чин в структуре 13 отрядов защитников душ.',
        minReputation: 35,
        badgeEmoji: '⚔️',
        color: '#60A5FA',
        bonusSummary: '+20 к Щитам, +5 к Орудиям',
        perk: { extraShields: 20, extraWeapons: 5 }
      },
      {
        id: 'title_soul_baron',
        kingdomId: 'soul_society',
        kingdomName: 'Сообщество Душ',
        rank: 'baron',
        title: 'Лорд-Хранитель Сэйрэйтэя',
        description: 'Дворянский титул с правом входа в закрытые сектора казарм.',
        minReputation: 50,
        badgeEmoji: '🛡️',
        color: '#818CF8',
        bonusSummary: '+30 к Щитам, +15 Науки за цикл',
        perk: { extraShields: 30, extraScience: 15 }
      },
      {
        id: 'title_soul_protector',
        kingdomId: 'soul_society',
        kingdomName: 'Сообщество Душ',
        rank: 'lord_protector',
        title: 'Хранитель Баланса Трёх Миров',
        description: 'Высшее духовное звание, оберегающее ткань мироздания.',
        minReputation: 70,
        badgeEmoji: '✨',
        color: '#A78BFA',
        bonusSummary: '+45 к Щитам, +8 к Орудиям',
        perk: { extraShields: 45, extraWeapons: 8 }
      },
      {
        id: 'title_soul_champion',
        kingdomId: 'soul_society',
        kingdomName: 'Сообщество Душ',
        rank: 'grand_champion',
        title: 'Длань Короля Душ (Рейо)',
        description: 'Божественный избранник, наделённый прямой милостью Суверена Рейо.',
        minReputation: 90,
        badgeEmoji: '👑',
        color: '#38BDF8',
        bonusSummary: '+65 к Щитам, +15 к Орудиям, +300 ⬡ за цикл',
        perk: { extraShields: 65, extraWeapons: 15, extraCredits: 300 }
      }
    ]
  },

  // ===================== 2. NAMEK REALM (DRAGON BALL) =====================
  {
    id: 'namek_realm',
    name: 'Великое Мистическое Царство Намек',
    shortName: 'Царство Намек',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Намек',
    monarchName: 'Великий Патриарх Старейшина Гуру',
    monarchTitle: 'Патриарх и Монарх Намекианцев, Творец Священных Жемчужин',
    monarchNpcId: 'king_guru_namek',
    capitalSystemId: 'namek',
    capitalName: 'Священное Плато Аджиса (Планета Намек)',
    controlledSystemIds: ['namek'],
    bannerEmoji: '✨',
    bannerSymbol: '🐉🔮',
    color: '#34D399',
    accentBg: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
    governmentType: 'Патриархальная Духовная Монархия Старейшин',
    ideology: 'Вечная Гармония Природы, Культивация Духа Ки и Защита Жемчужин',
    anthemQuote: '«Три солнца озаряют зелёные холмы Намека. Сила духа превыше стали и огня».',
    lore: 'Мудрое и древнее царство намекианцев, населяющее планету Намек с её тремя солнцами. Здесь выращивают целебные бобы Сэндзу, изучают сакральные поля Ки и оберегают гигантские Жемчужины Дракона Порунги, способные исполнить любые три желания.',
    militaryPower: 115000,
    treasury: 260000,
    territorySharePercent: 18,
    reputation: 30,
    allegiance: 'friend',
    playerInvestment: 0,
    privileges: [
      {
        id: 'namek_priv_ajisa',
        title: 'Благословение Древа Аджиса',
        description: 'Намекианские семена священного древа Аджиса улучшают снабжение и питание на борту и в колониях.',
        effectSummary: 'Каждый цикл: +35 Продовольствия и +150 ⬡ дохода',
        minReputation: 15,
        costCredits: 750,
        costAlloys: 30,
        unlocked: false,
        passiveBonus: {
          cycleFoodYield: 35,
          cycleCreditsYield: 150
        }
      },
      {
        id: 'namek_priv_ki_surge',
        title: 'Пробуждение Внутренней Ки',
        description: 'Техники намекианских боевых монахов позволяют сенсорам и маневровым соплам реагировать со сверхъестественной скоростью.',
        effectSummary: '+8% к базовому уклонению и +5 к Мощности Орудий',
        minReputation: 35,
        costCredits: 1400,
        costScience: 150,
        unlocked: false,
        passiveBonus: {
          evasion: 8,
          weaponsPower: 5
        }
      },
      {
        id: 'namek_priv_porunga_favor',
        title: 'Покровительство Великого Дракона Порунги',
        description: 'Патриарх Гуру дарует вашему судну священный оберег Порунги: наномашины Ки непрерывно залечивают микротрещины корпуса.',
        effectSummary: '+50 к максимальной Прочности Корпуса корабля',
        minReputation: 60,
        costCredits: 3500,
        costScience: 300,
        costAntimatter: 30,
        unlocked: false,
        passiveBonus: {
          extraHull: 50
        }
      }
    ],
    petitions: [
      {
        id: 'namek_petition_reforest',
        title: 'Возрождение Рощ Древа Аджиса',
        description: 'Доставьте 50 единиц продовольствия и семян для восстановления экологического купола Намека.',
        requirementText: 'Требуется: 50 ед. Продовольствия',
        rewardSummary: '+900 ⬡, +35 Репутации Царства, +300 XP',
        cost: {
          food: 50
        },
        reward: {
          credits: 900,
          reputationGain: 35,
          xp: 300,
          science: 80
        },
        completed: false
      },
      {
        id: 'namek_petition_fuel_shield',
        title: 'Энергетическое Питание Защитного Поля Гуру',
        description: 'Намекианские старейшины просят 30 ед. очищенного Гелия-3 для подпитки планетарного щита от рейдеров.',
        requirementText: 'Требуется: 30 ед. Гелия-3 (Топлива)',
        rewardSummary: '+1100 ⬡, +25 Репутации, +40 Антиматерии',
        cost: {
          credits: 100 // abstracted
        },
        reward: {
          credits: 1100,
          reputationGain: 25,
          antimatter: 40,
          xp: 250
        },
        completed: false
      }
    ],
    titles: [
      {
        id: 'title_namek_friend',
        kingdomId: 'namek_realm',
        kingdomName: 'Царство Намек',
        rank: 'friend',
        title: 'Друг Клана Старейшин',
        description: 'Принят старейшинами Намека с миром и почтением.',
        minReputation: 15,
        badgeEmoji: '🌿',
        color: '#34D399',
        bonusSummary: '+15 к Корпусу, +25 Продовольствия за цикл',
        perk: { extraHull: 15, extraCredits: 80 }
      },
      {
        id: 'title_namek_knight',
        kingdomId: 'namek_realm',
        kingdomName: 'Царство Намек',
        rank: 'knight',
        title: 'Воин-Защитник Намека',
        description: 'Обучен намекианской концентрации духовной энергии Ки.',
        minReputation: 35,
        badgeEmoji: '🐉',
        color: '#10B981',
        bonusSummary: '+25 к Корпусу, +5 к Орудиям',
        perk: { extraHull: 25, extraWeapons: 5 }
      },
      {
        id: 'title_namek_baron',
        kingdomId: 'namek_realm',
        kingdomName: 'Царство Намек',
        rank: 'baron',
        title: 'Хранитель Сакральных Рощ Аджиса',
        description: 'Попечитель древних древесных рощ планеты трёх солнц.',
        minReputation: 50,
        badgeEmoji: '🌲',
        color: '#059669',
        bonusSummary: '+40 к Корпусу, +40 Продовольствия за цикл',
        perk: { extraHull: 40, extraCredits: 150 }
      },
      {
        id: 'title_namek_protector',
        kingdomId: 'namek_realm',
        kingdomName: 'Царство Намек',
        rank: 'lord_protector',
        title: 'Избранник Дракона Порунги',
        description: 'Тот, чьё сердце признано драконом чистым и непоколебимым.',
        minReputation: 70,
        badgeEmoji: '🔮',
        color: '#047857',
        bonusSummary: '+60 к Корпусу, +10 к Орудиям',
        perk: { extraHull: 60, extraWeapons: 10 }
      },
      {
        id: 'title_namek_champion',
        kingdomId: 'namek_realm',
        kingdomName: 'Царство Намек',
        rank: 'grand_champion',
        title: 'Верховный Хранитель Сфер Дракона',
        description: 'Легендарный паладин, охраняющий тайну семи жемчужин Намека.',
        minReputation: 90,
        badgeEmoji: '✨',
        color: '#34D399',
        bonusSummary: '+80 к Корпусу, +18 к Орудиям, +1000 ⬡',
        perk: { extraHull: 80, extraWeapons: 18, extraCredits: 500 }
      }
    ]
  },

  // ===================== 3. UNITED TERRAN KINGDOM =====================
  {
    id: 'terran_monarchy',
    name: 'Солнечное Звёздное Королевство Терры',
    shortName: 'Королевство Терры',
    universe: 'galaxy',
    universeName: 'Галактическое Содружество',
    monarchName: 'Император Люциус III Валуа',
    monarchTitle: 'Верховный Монарх Солнечной Метрополии и Протекторатов ОФЗ',
    monarchNpcId: 'king_emperor_lucius',
    capitalSystemId: 'sol',
    capitalName: 'Императорский Дворец Земли & Орбитальная Корона (Солнце)',
    controlledSystemIds: ['sol', 'centauri', 'vega'],
    bannerEmoji: '🦁',
    bannerSymbol: '👑☀️',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    governmentType: 'Конституционная Звёздная Монархия',
    ideology: 'Процветание Человечества, Закон и Порядок Золотого Флота',
    anthemQuote: '«Под сиянием древнего Солнца рождается судьба звёздного человечества».',
    lore: 'Старейшая монархия людей, основанная на орбите прародины Терры. Владеет мощнейшим золотым дредноутным флотом, жестко пресекает пиратство и обеспечивает безопасные торговые коридоры для вольных торговцев и исследователей.',
    militaryPower: 180000,
    treasury: 550000,
    territorySharePercent: 32,
    reputation: 20,
    allegiance: 'friend',
    playerInvestment: 0,
    privileges: [
      {
        id: 'terran_priv_trade_patent',
        title: 'Королевская Торговая Грамота',
        description: 'Официальный патент купца Первой Гильдии: снижает пошлины на всех рынках Королевства Терры.',
        effectSummary: '-15% стоимость покупки товаров на рынках, +15% выручка при продаже',
        minReputation: 15,
        costCredits: 1000,
        unlocked: false,
        passiveBonus: {
          cycleCreditsYield: 200
        }
      },
      {
        id: 'terran_priv_armor_plating',
        title: 'Броня Королевской Звёздной Гвардии',
        description: 'Многослойные композитные пластины из аурум-сплавов усиливают обшивку корабля.',
        effectSummary: '+40 к Прочности Корпуса и +10 Сплавов каждый цикл',
        minReputation: 35,
        costCredits: 2000,
        costAlloys: 50,
        unlocked: false,
        passiveBonus: {
          extraHull: 40,
          cycleAlloysYield: 10
        }
      },
      {
        id: 'terran_priv_dreadnought_guns',
        title: 'Королевский Оружейный Калибр',
        description: 'Турболазерные матрицы королевского арсенала поднимают огневую мощь вашего корабля до уровня линейного крейсера.',
        effectSummary: '+12 к Огневой Мощи главного калибра',
        minReputation: 60,
        costCredits: 4000,
        costAlloys: 80,
        costAntimatter: 20,
        unlocked: false,
        passiveBonus: {
          weaponsPower: 12
        }
      }
    ],
    petitions: [
      {
        id: 'terran_petition_patrol_bonds',
        title: 'Военный Заём на Постройку Крейсера «Люциус»',
        description: 'Вложите 1500 кредитов в военные облигации Короны Терры против пиратских набегов.',
        requirementText: 'Требуется: 1500 ⬡ Кредитов',
        rewardSummary: '+35 Репутации Терры, +450 XP Командира, +1 Термоядерный Заряд',
        cost: {
          credits: 1500
        },
        reward: {
          credits: 0,
          reputationGain: 35,
          xp: 450,
          nukes: 1,
          alloys: 50
        },
        completed: false
      }
    ],
    titles: [
      {
        id: 'title_terran_friend',
        kingdomId: 'terran_monarchy',
        kingdomName: 'Королевство Терры',
        rank: 'friend',
        title: 'Купец Первой Гильдии',
        description: 'Привилегированный торговец с имперской грамотой Метрополии.',
        minReputation: 15,
        badgeEmoji: '📜',
        color: '#F59E0B',
        bonusSummary: '+150 ⬡ дохода за цикл, +10 к Корпусу',
        perk: { extraHull: 10, extraCredits: 150 }
      },
      {
        id: 'title_terran_knight',
        kingdomId: 'terran_monarchy',
        kingdomName: 'Королевство Терры',
        rank: 'knight',
        title: 'Рыцарь Солнечного Ордена',
        description: 'Кавалер Золотого Креста, присягнувший защищать миры Солнца.',
        minReputation: 35,
        badgeEmoji: '☀️',
        color: '#FBBF24',
        bonusSummary: '+25 к Корпусу, +8 к Орудиям',
        perk: { extraHull: 25, extraWeapons: 8 }
      },
      {
        id: 'title_terran_baron',
        kingdomId: 'terran_monarchy',
        kingdomName: 'Королевство Терры',
        rank: 'baron',
        title: 'Имперский Барон Внешних Рубежей',
        description: 'Титулованный наместник пограничных секторов Федерации.',
        minReputation: 50,
        badgeEmoji: '🦁',
        color: '#D97706',
        bonusSummary: '+45 к Корпусу, +250 ⬡ дохода за цикл',
        perk: { extraHull: 45, extraCredits: 250 }
      },
      {
        id: 'title_terran_protector',
        kingdomId: 'terran_monarchy',
        kingdomName: 'Королевство Терры',
        rank: 'lord_protector',
        title: 'Лорд-Адмирал Золотого Флота',
        description: 'Флагманский командующий сводными эскадрами Терры и Марса.',
        minReputation: 70,
        badgeEmoji: '⚓',
        color: '#B45309',
        bonusSummary: '+65 к Корпусу, +14 к Орудиям',
        perk: { extraHull: 65, extraWeapons: 14 }
      },
      {
        id: 'title_terran_champion',
        kingdomId: 'terran_monarchy',
        kingdomName: 'Королевство Терры',
        rank: 'grand_champion',
        title: 'Великий Протектор Человечества',
        description: 'Высшее звание Империи, вручаемое лично Императором Люциусом III.',
        minReputation: 90,
        badgeEmoji: '👑',
        color: '#F59E0B',
        bonusSummary: '+90 к Корпусу, +20 к Орудиям, +500 ⬡ за цикл',
        perk: { extraHull: 90, extraWeapons: 20, extraCredits: 500 }
      }
    ]
  },

  // ===================== 4. CYBER-KINGDOM OF SIRIUS =====================
  {
    id: 'sirius_cyber',
    name: 'Горнорудное & Кибер-Королевство Сириуса',
    shortName: 'Королевство Сириуса',
    universe: 'galaxy',
    universeName: 'Галактическое Содружество',
    monarchName: 'Торгрим «Железный Кулак»',
    monarchTitle: 'Король Шахтёрских Недр, Верховный Глава Горных Гильдий',
    monarchNpcId: 'king_miner_thorgrim',
    capitalSystemId: 'sirius',
    capitalName: 'Литейная Цитадель Сириуса-А',
    controlledSystemIds: ['sirius', 'procyon'],
    bannerEmoji: '⛏️',
    bannerSymbol: '⚡🔨',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    governmentType: 'Шахтёрско-Технократический Монархат',
    ideology: 'Несокрушимость Металла, Энергия Недр и Трудовая Честь',
    anthemQuote: '«Звёзды холодны, но наше литейное пламя согреет любую колонию».',
    lore: 'Могущественное горно-промышленное и кибернетическое царство, объединяющее астероидные рудники и гигантские верфи Сириуса. Производит львиную долю титановых сплавов и композитов для всей галактики.',
    militaryPower: 130000,
    treasury: 410000,
    territorySharePercent: 22,
    reputation: 15,
    allegiance: 'neutral',
    playerInvestment: 0,
    privileges: [
      {
        id: 'sirius_priv_nano_hull',
        title: 'Нано-Регенеративная Матрица Буровиков',
        description: 'Микроскопические наниты Сириуса непрерывно восстанавливают энергетические узлы судна.',
        effectSummary: '+20 к Щитам, +15 к Корпусу, +15 Сплавов каждый цикл',
        minReputation: 15,
        costCredits: 900,
        costScience: 150,
        unlocked: false,
        passiveBonus: {
          extraShields: 20,
          extraHull: 15,
          cycleAlloysYield: 15
        }
      },
      {
        id: 'sirius_priv_quantum_radar',
        title: 'Тяжёлые Буровые Лазеры Сириуса',
        description: 'Горнорудные плазменные резаки переоборудованы в боевые турели ближнего боя.',
        effectSummary: '+6 к Огневой Мощи и +10 к Вместимости Трюма',
        minReputation: 35,
        costCredits: 1600,
        costScience: 220,
        unlocked: false,
        passiveBonus: {
          weaponsPower: 6,
          cargoBonus: 10
        }
      },
      {
        id: 'sirius_priv_singularity_core',
        title: 'Сингулярный Реактор Литейных Недр',
        description: 'Вершина инженерной мысли: непрерывно вырабатывает чистую научную информацию и антиматерию.',
        effectSummary: 'Каждый цикл: +30 Науки и +8 Антиматерии',
        minReputation: 60,
        costCredits: 3800,
        costScience: 350,
        costAntimatter: 45,
        unlocked: false,
        passiveBonus: {
          cycleScienceYield: 30,
          cycleAntimatterYield: 8
        }
      }
    ],
    petitions: [
      {
        id: 'sirius_petition_science_feed',
        title: 'Геологическая Разведка Астероидов',
        description: 'Предоставьте 120 единиц Научных Данных для калибровки автоматических буровых станций.',
        requirementText: 'Требуется: 120 ед. Науки',
        rewardSummary: '+1600 ⬡, +30 Репутации Сириуса, +40 Антиматерии',
        cost: {
          science: 120
        },
        reward: {
          credits: 1600,
          reputationGain: 30,
          antimatter: 40,
          xp: 400
        },
        completed: false
      }
    ],
    titles: [
      {
        id: 'title_sirius_friend',
        kingdomId: 'sirius_cyber',
        kingdomName: 'Королевство Сириуса',
        rank: 'friend',
        title: 'Партнёр Литейных Гильдий',
        description: 'Признанный деловой партнёр горнорудных консорциумов Сириуса.',
        minReputation: 15,
        badgeEmoji: '⚙️',
        color: '#10B981',
        bonusSummary: '+10 Сплавов за цикл, +10 к Корпусу',
        perk: { extraHull: 10, extraCredits: 90 }
      },
      {
        id: 'title_sirius_knight',
        kingdomId: 'sirius_cyber',
        kingdomName: 'Королевство Сириуса',
        rank: 'knight',
        title: 'Железный Рыцарь Недр',
        description: 'Офицер астероидного бурового дозора, закалённый в радиационных поясах.',
        minReputation: 35,
        badgeEmoji: '⛏️',
        color: '#34D399',
        bonusSummary: '+25 к Корпусу, +15 Сплавов за цикл',
        perk: { extraHull: 25, extraWeapons: 6 }
      },
      {
        id: 'title_sirius_baron',
        kingdomId: 'sirius_cyber',
        kingdomName: 'Королевство Сириуса',
        rank: 'baron',
        title: 'Мастер-Смотритель Астероидов',
        description: 'Управляющий сектором глубинной добычи титана и платины.',
        minReputation: 50,
        badgeEmoji: '🔨',
        color: '#059669',
        bonusSummary: '+35 к Щитам, +25 Сплавов за цикл',
        perk: { extraShields: 35, extraCredits: 180 }
      },
      {
        id: 'title_sirius_protector',
        kingdomId: 'sirius_cyber',
        kingdomName: 'Королевство Сириуса',
        rank: 'lord_protector',
        title: 'Верховный Технократ Сириуса',
        description: 'Глава инженерно-производственного конклава Литейной Цитадели.',
        minReputation: 70,
        badgeEmoji: '⚡',
        color: '#047857',
        bonusSummary: '+50 к Щитам, +25 Науки за цикл',
        perk: { extraShields: 50, extraScience: 25 }
      },
      {
        id: 'title_sirius_champion',
        kingdomId: 'sirius_cyber',
        kingdomName: 'Королевство Сириуса',
        rank: 'grand_champion',
        title: 'Владыка Квантового Монолита',
        description: 'Высший монарший титул, дарующий право голоса в совете Торгрима.',
        minReputation: 90,
        badgeEmoji: '🧠',
        color: '#10B981',
        bonusSummary: '+70 к Щитам, +40 Науки за цикл, +6 Антиматерии',
        perk: { extraShields: 70, extraScience: 40, extraCredits: 400 }
      }
    ]
  },

  // ===================== 5. SHADOW CORSAIR REALM =====================
  {
    id: 'shadow_syndicate',
    name: 'Теневое Королевство Консорциума и Корсаров',
    shortName: 'Королевство Корсаров',
    universe: 'galaxy',
    universeName: 'Галактическое Содружество',
    monarchName: 'Малахай «Чёрный Вихрь»',
    monarchTitle: 'Теневой Король Корсаров, Владыка Пиратского Престола',
    monarchNpcId: 'king_corsair_malakai',
    capitalSystemId: 'omega',
    capitalName: 'Астероидное Логово «Чёрный Череп» (Система Омега)',
    controlledSystemIds: ['omega', 'kepler', 'terminus'],
    bannerEmoji: '☠️',
    bannerSymbol: '🗡️🏴‍☠️',
    color: '#F43F5E',
    accentBg: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    governmentType: 'Конфедерация Корсарских Баронов и Теневого Совета',
    ideology: 'Абсолютная Свобода Наживы, Власть Чёрного Рынка и Превосходство Силы',
    anthemQuote: '«Законы пишутся для слабых, а звёздные богатства принадлежат тем, кто смеет их взять».',
    lore: 'Тайное королевство пиратских флотов, контрабандистов и изгоев, скрывающееся в туманностях и астероидных полях. Управляет глобальной сетью чёрных рынков, скупает краденые реликвии и продает запрещенные технологии.',
    militaryPower: 160000,
    treasury: 620000,
    territorySharePercent: 24,
    reputation: -10,
    allegiance: 'neutral',
    playerInvestment: 0,
    privileges: [
      {
        id: 'shadow_priv_smuggler_bays',
        title: 'Фальшивые Переборки и Тайники Трюма',
        description: 'Корсарские инженеры маскируют грузовые отсеки экранирующей сеткой: таможня теряет след контрабанды.',
        effectSummary: '+18 к Вместимости Трюма и -40% к угрозе пиратских засад',
        minReputation: 15,
        costCredits: 1200,
        unlocked: false,
        passiveBonus: {
          cargoBonus: 18
        }
      },
      {
        id: 'shadow_priv_corsair_overdrive',
        title: 'Форсажные Форсунки Корсаров',
        description: 'Впрыск перегретого изотопа в маневровые движки гарантирует отрыв от полицейских эскадр.',
        effectSummary: '+10% к Уклонению и +8 к Огневой Мощи',
        minReputation: 35,
        costCredits: 2200,
        costAlloys: 60,
        unlocked: false,
        passiveBonus: {
          evasion: 10,
          weaponsPower: 8
        }
      },
      {
        id: 'shadow_priv_black_dividend',
        title: 'Доля в Общаке Теневого Синдиката',
        description: 'Король Мордред выделяет вам персональную долю от межзвёздных рейдерских операций.',
        effectSummary: 'Каждый цикл: +350 ⬡ Кредитов и +1 Термоядерный Заряд раз в 4 цикла',
        minReputation: 60,
        costCredits: 4500,
        costAntimatter: 30,
        unlocked: false,
        passiveBonus: {
          cycleCreditsYield: 350
        }
      }
    ],
    petitions: [
      {
        id: 'shadow_petition_contraband_stash',
        title: 'Поставка Оружия для Корсарского Рейда',
        description: 'Снабдите пиратскую эскадру 50 единицами сверхпрочных сплавов.',
        requirementText: 'Требуется: 50 ед. Сплавов',
        rewardSummary: '+1800 ⬡ Чёрных Кредитов, +35 Репутации Синдиката, +2 Ядерки',
        cost: {
          alloys: 50
        },
        reward: {
          credits: 1800,
          reputationGain: 35,
          nukes: 2,
          xp: 450
        },
        completed: false
      }
    ],
    titles: [
      {
        id: 'title_shadow_friend',
        kingdomId: 'shadow_syndicate',
        kingdomName: 'Королевство Корсаров',
        rank: 'friend',
        title: 'Свой Среди Корсаров',
        description: 'Вольный капитан, имеющий доступ в тайные порты Завесы.',
        minReputation: 15,
        badgeEmoji: '🏴‍☠️',
        color: '#F43F5E',
        bonusSummary: '+120 ⬡ дохода за цикл, +5 к Орудиям',
        perk: { extraWeapons: 5, extraCredits: 120 }
      },
      {
        id: 'title_shadow_knight',
        kingdomId: 'shadow_syndicate',
        kingdomName: 'Королевство Корсаров',
        rank: 'knight',
        title: 'Капитан Чёрного Флага',
        description: 'Капер с официальной охранной грамотой Малахая.',
        minReputation: 35,
        badgeEmoji: '🗡️',
        color: '#FB7185',
        bonusSummary: '+8 к Орудиям, +8% к Уклонению',
        perk: { extraWeapons: 8, extraCredits: 150 }
      },
      {
        id: 'title_shadow_baron',
        kingdomId: 'shadow_syndicate',
        kingdomName: 'Королевство Корсаров',
        rank: 'baron',
        title: 'Теневой Барон Консорциума',
        description: 'Владелец сети подпольных факторий и контрабандных складов.',
        minReputation: 50,
        badgeEmoji: '☠️',
        color: '#E11D48',
        bonusSummary: '+14 к Орудиям, +250 ⬡ дохода за цикл',
        perk: { extraWeapons: 14, extraCredits: 250 }
      },
      {
        id: 'title_shadow_protector',
        kingdomId: 'shadow_syndicate',
        kingdomName: 'Королевство Корсаров',
        rank: 'lord_protector',
        title: 'Атаман Вольного Берега',
        description: 'Предводитель корсарской флотилии, внушающий ужас торговым путям.',
        minReputation: 70,
        badgeEmoji: '💀',
        color: '#BE123C',
        bonusSummary: '+20 к Орудиям, +350 ⬡ за цикл',
        perk: { extraWeapons: 20, extraCredits: 350 }
      },
      {
        id: 'title_shadow_champion',
        kingdomId: 'shadow_syndicate',
        kingdomName: 'Королевство Корсаров',
        rank: 'grand_champion',
        title: 'Легенда Чёрной Бездны',
        description: 'Мифический корсар, чьё имя передают шёпотом от Тортуги до Земли.',
        minReputation: 90,
        badgeEmoji: '🔥',
        color: '#F43F5E',
        bonusSummary: '+25 к Орудиям, +15% к Уклонению, +500 ⬡ за цикл',
        perk: { extraWeapons: 25, extraCredits: 500 }
      }
    ]
  }
];
