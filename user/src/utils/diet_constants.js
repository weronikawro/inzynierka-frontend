import vegeeImg from "../assets/images/vegee.jpg";
import veganImg from "../assets/images/dieta_weganska.jpg";
import lactoseImg from "../assets/images/dieta_bezlaktozy.jpg";
import glutenImg from "../assets/images/dieta_bezglutenowa.jpg";
import lowCarbImg from "../assets/images/dieta_lowcarb.jpg";
import highProteinImg from "../assets/images/dieta_wysokobialkowa.jpeg";
import lowFatImg from "../assets/images/dieta_niskotluszczowa.jpg";
import lightImg from "../assets/images/dieta_lekkostrawna.jpg";
import dashImg from "../assets/images/dieta_dash.jpg";
import fodmapImg from "../assets/images/dieta_fodmap.jpg";

export const DIET_DEFINITIONS = [
  {
    id: "wegetarianske",
    title: "Dieta Wegetariańska",
    tag: "Wegetariańskie",
    image: vegeeImg,
    desc: "Model żywienia polegający na eliminacji mięsa i ryb, oparty na warzywach, owocach, produktach pełnoziarnistych, roślinach strączkowych, orzechach, nasionach, nabiale i jajach. Odpowiednio zbilansowana dostarcza wszystkich niezbędnych składników odżywczych, w tym białka roślinnego, błonnika, witamin z grupy B oraz antyoksydantów.",
    benefits:
      "Wspiera profilaktykę chorób serca, poprawia funkcjonowanie jelit dzięki wysokiej podaży błonnika, sprzyja utrzymaniu prawidłowej masy ciała oraz może obniżać poziom cholesterolu LDL.",
  },
  {
    id: "weganskie",
    title: "Dieta Wegańska",
    tag: "Wegańskie",
    image: veganImg,
    desc: "Dieta całkowicie roślinna eliminująca wszystkie produkty pochodzenia zwierzęcego, w tym mięso, ryby, nabiał, jaja oraz miód. Opiera się na warzywach, owocach, strączkach, zbożach, orzechach i nasionach. Wymaga świadomego bilansowania pod kątem witaminy B12, żelaza, wapnia oraz kwasów omega-3.",
    benefits:
      "Może obniżać poziom cholesterolu, wspierać zdrowie metaboliczne, redukować stan zapalny organizmu oraz zmniejszać ryzyko cukrzycy typu 2 i nadciśnienia.",
  },
  {
    id: "bezlaktozy",
    title: "Dieta Bez Laktozy",
    tag: "Bez laktozy",
    image: lactoseImg,
    desc: "Przeznaczona dla osób z nietolerancją laktozy, polega na eliminacji mleka i produktów zawierających laktozę. Bazuje na produktach bezlaktozowych oraz napojach roślinnych wzbogacanych w wapń i witaminę D.",
    benefits:
      "Redukuje wzdęcia, bóle brzucha, biegunki i uczucie ciężkości, poprawiając komfort trawienny oraz jakość codziennego funkcjonowania.",
  },
  {
    id: "bezglutenowe",
    title: "Dieta Bezglutenowa",
    tag: "Bezglutenowe",
    image: glutenImg,
    desc: "Podstawowa terapia żywieniowa w celiakii oraz nieceliakalnej nadwrażliwości na gluten. Eliminuje pszenicę, żyto, jęczmień oraz produkty je zawierające. Opiera się na naturalnie bezglutenowych produktach takich jak ryż, gryka, kukurydza, komosa ryżowa i ziemniaki.",
    benefits:
      "Wspiera regenerację jelit, poprawia wchłanianie składników odżywczych, redukuje dolegliwości trawienne oraz przewlekłe zmęczenie.",
  },
  {
    id: "lowcarb",
    title: "Dieta Low Carb",
    tag: "Low Carb",
    image: lowCarbImg,
    desc: "Model żywienia ograniczający spożycie węglowodanów na rzecz zwiększonej podaży białka i zdrowych tłuszczów. Opiera się na warzywach o niskim indeksie glikemicznym, rybach, jajach, mięsie, orzechach oraz olejach roślinnych.",
    benefits:
      "Stabilizuje poziom glukozy i insuliny, wspomaga redukcję masy ciała, zmniejsza napady głodu oraz poprawia kontrolę apetytu.",
  },
  {
    id: "wysokobialkowe",
    title: "Dieta Wysokobiałkowa",
    tag: "Wysokobiałkowe",
    image: highProteinImg,
    desc: "Dieta o zwiększonej podaży białka, szczególnie popularna wśród osób aktywnych fizycznie oraz w okresie redukcji masy ciała. Źródłem białka są chude mięsa, ryby, nabiał, jaja oraz rośliny strączkowe.",
    benefits:
      "Wspiera regenerację i budowę mięśni, zwiększa uczucie sytości, przyspiesza metabolizm oraz pomaga w utrzymaniu masy mięśniowej podczas redukcji.",
  },
  {
    id: "niskotluszczowe",
    title: "Dieta Niskotłuszczowa",
    tag: "Niskotłuszczowe",
    image: lowFatImg,
    desc: "Model żywienia ograniczający spożycie tłuszczów, szczególnie nasyconych i trans. Zalecany przy schorzeniach wątroby, trzustki oraz w profilaktyce chorób układu krążenia.",
    benefits:
      "Wspiera układ sercowo-naczyniowy, obniża poziom cholesterolu LDL oraz może redukować ryzyko miażdżycy.",
  },
  {
    id: "lekkostrawna",
    title: "Dieta Lekkostrawna",
    tag: "Lekkostrawne",
    image: lightImg,
    desc: "Dieta oszczędzająca przewód pokarmowy poprzez eliminację potraw smażonych, tłustych i wzdymających. Bazuje na gotowaniu, duszeniu i pieczeniu bez dodatku tłuszczu.",
    benefits:
      "Polecana przy problemach żołądkowo-jelitowych, w okresie rekonwalescencji oraz dla osób starszych – zmniejsza obciążenie układu trawiennego.",
  },
  {
    id: "DASH",
    title: "Dieta DASH",
    tag: "DASH",
    image: dashImg,
    desc: "Model żywienia opracowany w celu obniżania ciśnienia tętniczego. Opiera się na warzywach, owocach, pełnoziarnistych produktach zbożowych, chudym nabiale, rybach i orzechach, przy jednoczesnym ograniczeniu soli i żywności przetworzonej.",
    benefits:
      "Skutecznie obniża ciśnienie krwi, wspiera zdrowie serca oraz zmniejsza ryzyko udaru i chorób układu krążenia.",
  },
  {
    id: "FODMAP",
    title: "Dieta FODMAP",
    tag: "FODMAP",
    image: fodmapImg,
    desc: "Specjalistyczna dieta eliminacyjna stosowana w zespole jelita drażliwego (IBS). Polega na czasowym ograniczeniu fermentujących oligo-, di-, monosacharydów i polioli, które mogą powodować dolegliwości trawienne.",
    benefits:
      "Redukuje wzdęcia, bóle brzucha, gazy i nieregularne wypróżnienia, poprawiając komfort życia osób z nadwrażliwym jelitem.",
  },
];
