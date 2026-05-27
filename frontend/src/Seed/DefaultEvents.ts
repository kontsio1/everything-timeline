import { TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {SeedEventsData, SeedsEnum} from "./SeedEventsDataType";

export const DefaultEvents: SeedEventsData = {
    Name: "Default Events",
    Value: SeedsEnum.DefaultEvents,
    Events:
        [
            new TimelineEvent("1", [-3200], "Unification of Egypt"),
            new TimelineEvent("2", [-3100], "First Cuneiform Writing"),
            new TimelineEvent("3", [-2700], "Step Pyramid of Djoser"),
            new TimelineEvent("4", [-2560], "Great Pyramid of Giza"),
            new TimelineEvent("5", [-2334], "Founding of Akkadian Empire"),
            new TimelineEvent("6", [-2270], "Construction of the Great Ziggurat of Ur"),
            // new TimelineEvent([-2150], "Old Kingdom of Egypt collapse"), not important
            new TimelineEvent("7", [-2100], "Epic of Gilgamesh"),
            new TimelineEvent("8", [-2000], "Minoan civilization peak"),
            new TimelineEvent("9", [-1894], "Babylonian Empire establishment"),
            new TimelineEvent("10", [-1754], "Code of Hammurabi"), //verify date
            new TimelineEvent("11", [-1600], "Shang Dynasty commences"),
            new TimelineEvent("12", [-1500], "Hittite Empire peak"),
            new TimelineEvent("13", [-1350], "Mycenaean Greece peak"),
            // new TimelineEvent([-1500], "Vedic period beginning"), turn into period
            // new TimelineEvent([-1479], "Hatshepsut's reign"),
            // new TimelineEvent([-1353], "Akhenaten's monotheism"),
            new TimelineEvent("14", [-1323], "Tutankhamun's death"),
            new TimelineEvent("15", [-1274], "Battle of Kadesh"),
            new TimelineEvent("16", [-1213], "Ramesses II death"),
            new TimelineEvent("17", [-1200], "Bronze Age collapse"),
            new TimelineEvent("18", [-1184], "Fall of Troy", "Date is debated, but often placed around 12th century BCE based on archaeological evidence and ancient texts. The traditional date of 1184 BCE comes from the ancient Greek historian Eratosthenes, who calculated it based on the reigns of various kings and events in Greek mythology. However, modern archaeological findings suggest that the actual fall of Troy may have occurred around 1250-1190 BCE. The exact date remains uncertain due to the legendary nature of the event and the lack of definitive historical records."),
            new TimelineEvent("19", [-1122], "Zhou conquest of Shang"),
            new TimelineEvent("20", [-1000], "David conquers Jerusalem"),
            new TimelineEvent("21", [-970], "Solomon's Temple"),
            new TimelineEvent("22", [-814], "Founding of Carthage"),
            new TimelineEvent("23", [-776], "First Olympic Games"),
            new TimelineEvent("24", [-753], "Founding of Rome"),
            new TimelineEvent("25", [-671], "Assyrian conquest of Egypt"),
            new TimelineEvent("26", [-689], "Siege of Babylon by Assyria"),
            new TimelineEvent("27", [-660], "Founding of Japan"),
            // new TimelineEvent([-626], "Neo-Babylonian Empire"),
            new TimelineEvent("28", [-612], "Fall of Nineveh"),
            new TimelineEvent("29", [-586], "Jerusalem destruction by the Babylonians"),
            new TimelineEvent("30", [-563], "Buddha's birth"),
            new TimelineEvent("31", [-551], "Confucius' birth"),
            new TimelineEvent("32", [-550], "Persian Empire foundation by Cyrus the Great"),
            new TimelineEvent("33", [-538], "Cyrus Cylinder - First Charter of Human Rights"),
            new TimelineEvent("34", [-509], "Founding of the Roman Republic"),
            new TimelineEvent("35", [-508], "Athenian democracy establishment"),
            new TimelineEvent("36", [-490], "Battle of Marathon"),
            new TimelineEvent("37", [-480], "Battle of Thermopylae"),
            new TimelineEvent("38", [-480], "Battle of Salamis"),
            new TimelineEvent("39", [-479], "Battle of Plataea"),
            new TimelineEvent("40", [-431], "Peloponnesian War begins"),//period for wars
            new TimelineEvent("41", [-399], "Socrates' execution"),//?
            new TimelineEvent("42", [-387], "Plato's Academy founded"),//?
            new TimelineEvent("43", [-336], "Philip II assassination"),
            new TimelineEvent("44", [-334], "Alexander's Persian invasion"),
            new TimelineEvent("45", [-323], "Alexander's death"),
            new TimelineEvent("46", [-264], "First Punic War begins"), // insert battles here
            new TimelineEvent("47", [-221], "Chinese unification by Qin"),
            new TimelineEvent("48", [-49], "Caesar becomes dictator"),
            new TimelineEvent("49", [-44], "Caesar's assassination"),
            new TimelineEvent("50", [476], "Fall of Western Roman Empire"),
            new TimelineEvent("51", [622], "Hijra - Beginning of Islamic Calendar"),
            new TimelineEvent("52", [800], "Charlemagne Crowned Emperor"),
            new TimelineEvent("53", [1066], "Norman Conquest of England"),
            new TimelineEvent("54", [1347], "Black Death Begins"),
            new TimelineEvent("55", [1453], "Fall of Constantinople"),
            new TimelineEvent("56", [1492], "Columbus Reaches the Americas"),
            new TimelineEvent("57", [1517], "Protestant Reformation Begins"),
            new TimelineEvent("58", [1776], "American Declaration of Independence"),
            new TimelineEvent("59", [1789], "French Revolution Begins"),
            new TimelineEvent("60", [1969], "Moon Landing"),
            new TimelineEvent("61", [2000], "Kostas Birthday"),
            new TimelineEvent("62", [2000], "Puppy Birthday"),
            new TimelineEvent("63", [2003], "Anastasia Birthday")
        ]
}

export const seedPeriods = [
    // Prehistoric Periods
    // new TimelinePeriod([-3300000], [-12000], "Paleolithic Era"),
    // new TimelinePeriod([-12000], [-8000], "Mesolithic Era"),
    // new TimelinePeriod([-8000], [-3000], "Neolithic Era"),
    new TimelinePeriod("1", [-3300], [-900], "Bronze Age"),
    new TimelinePeriod("2", [-1200], [-550], "Iron Age"),
    new TimelinePeriod("3", [-800], [476], "Classical Antiquity"),
    new TimelinePeriod("4", [476], [1453], "Middle Ages"),
    new TimelinePeriod("5", [1400], [1700], "Renaissance"),
    // new TimelinePeriod([1418], [1620], "Age of Discovery", 1),
    // new TimelinePeriod([1600], [1850], "Age of Sail", 1),
    // new TimelinePeriod([1600], [1750], "Baroque Period"),
    new TimelinePeriod("6", [1687], [1789], "Age of Enlightenment"),
    new TimelinePeriod("7", [1760], [1914], "Industrial Era"),
    // new TimelinePeriod([1815], [1914], "Pax Britannica"),
    // new TimelinePeriod([1840], [1914], "Second Industrial Revolution"),
    new TimelinePeriod("8", [1880], [1914], "Belle Époque"),
    new TimelinePeriod("9", [1914], [1918], "World War I"),
    new TimelinePeriod("10", [1929], [1939], "Great Depression"),
    new TimelinePeriod("11", [1939], [1945], "World War II"),
    new TimelinePeriod("12", [1945], [1991], "Cold War Era"),
    new TimelinePeriod("13", [1991], [2024], "Post-Cold War Era"),
];