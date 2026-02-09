import { TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
export const seedEvents: TimelineEvent[] = [
    new TimelineEvent([-3200], "Unification of Egypt"),
    new TimelineEvent([-3100], "First Cuneiform Writing"),
    new TimelineEvent([-2700], "Step Pyramid of Djoser"),
    new TimelineEvent([-2560], "Great Pyramid of Giza"),
    new TimelineEvent([-2334], "Founding of Akkadian Empire"),
    new TimelineEvent([-2270], "Construction of the Great Ziggurat of Ur"),
    // new TimelineEvent([-2150], "Old Kingdom of Egypt collapse"), not important 
    new TimelineEvent([-2100], "Epic of Gilgamesh"),
    new TimelineEvent([-2000], "Minoan civilization peak"),
    new TimelineEvent([-1894], "Babylonian Empire establishment"),
    new TimelineEvent([-1754], "Code of Hammurabi"), //verify date
    new TimelineEvent([-1600], "Shang Dynasty commences"),
    new TimelineEvent([-1500], "Hittite Empire peak"),
    new TimelineEvent([-1350], "Mycenaean Greece peak"),
    
    // new TimelineEvent([-1500], "Vedic period beginning"), turn into period
    // new TimelineEvent([-1479], "Hatshepsut's reign"),
    // new TimelineEvent([-1353], "Akhenaten's monotheism"),
    new TimelineEvent([-1323], "Tutankhamun's death"),
    new TimelineEvent([-1274], "Battle of Kadesh"),
    new TimelineEvent([-1213], "Ramesses II death"),
    new TimelineEvent([-1200], "Bronze Age collapse"),
    new TimelineEvent([-1184], "Fall of Troy", "Date is debated, but often placed around 12th century BCE based on archaeological evidence and ancient texts. The traditional date of 1184 BCE comes from the ancient Greek historian Eratosthenes, who calculated it based on the reigns of various kings and events in Greek mythology. However, modern archaeological findings suggest that the actual fall of Troy may have occurred around 1250-1190 BCE. The exact date remains uncertain due to the legendary nature of the event and the lack of definitive historical records."),
    new TimelineEvent([-1122], "Zhou conquest of Shang"),
    new TimelineEvent([-1000], "David conquers Jerusalem"),
    new TimelineEvent([-970], "Solomon's Temple"),
    new TimelineEvent([-814], "Founding of Carthage"),
    new TimelineEvent([-776], "First Olympic Games"),
    new TimelineEvent([-753], "Founding of Rome"),
    new TimelineEvent([-671], "Assyrian conquest of Egypt"),
    new TimelineEvent([-689], "Siege of Babylon by Assyria"),
    new TimelineEvent([-660], "Founding of Japan"),
    // new TimelineEvent([-626], "Neo-Babylonian Empire"),
    new TimelineEvent([-612], "Fall of Nineveh"),
    new TimelineEvent([-586], "Jerusalem destruction by the Babylonians"),
    new TimelineEvent([-563], "Buddha's birth"),
    new TimelineEvent([-551], "Confucius' birth"),
    new TimelineEvent([-550], "Persian Empire foundation by Cyrus the Great"),
    new TimelineEvent([-538], "Cyrus Cylinder - First Charter of Human Rights"),
    new TimelineEvent([-509], "Founding of the Roman Republic"),
    new TimelineEvent([-508], "Athenian democracy establishment"),
    new TimelineEvent([-490], "Battle of Marathon"),
    new TimelineEvent([-480], "Battle of Thermopylae"),
    new TimelineEvent([-480], "Battle of Salamis"),
    new TimelineEvent([-479], "Battle of Plataea"),
    new TimelineEvent([-431], "Peloponnesian War begins"),//period for wars
    
    new TimelineEvent([-399], "Socrates' execution"),//?
    new TimelineEvent([-387], "Plato's Academy founded"),//?
    
    new TimelineEvent([-336], "Philip II assassination"),
    new TimelineEvent([-334], "Alexander's Persian invasion"),
    new TimelineEvent([-323], "Alexander's death"),
    new TimelineEvent([-264], "First Punic War begins"), // insert battles here
    new TimelineEvent([-221], "Chinese unification by Qin"),
    new TimelineEvent([-49], "Caesar becomes dictator"),
    new TimelineEvent([-44], "Caesar's assassination"),
    
   
    new TimelineEvent([476], "Fall of Western Roman Empire"),
    new TimelineEvent([622], "Hijra - Beginning of Islamic Calendar"),
    new TimelineEvent([800], "Charlemagne Crowned Emperor"),
    new TimelineEvent([1066], "Norman Conquest of England"),
    new TimelineEvent([1347], "Black Death Begins"),
    new TimelineEvent([1453], "Fall of Constantinople"),
    new TimelineEvent([1492], "Columbus Reaches the Americas"),
    new TimelineEvent([1517], "Protestant Reformation Begins"),
    new TimelineEvent([1776], "American Declaration of Independence"),
    new TimelineEvent([1789], "French Revolution Begins"),
    new TimelineEvent([1969], "Moon Landing"),
    new TimelineEvent([2000], "Kostas Birthday"),
    new TimelineEvent([2003], "Anastasia Birthday")
    
];

export const seedPeriods = [
    // Prehistoric Periods
    // new TimelinePeriod([-3300000], [-12000], "Paleolithic Era"),
    // new TimelinePeriod([-12000], [-8000], "Mesolithic Era"),
    // new TimelinePeriod([-8000], [-3000], "Neolithic Era"),
    new TimelinePeriod([-3300], [-1200], "Bronze Age"),
    new TimelinePeriod([-1200], [550], "Iron Age"),
    new TimelinePeriod([800], [1000], "Classical Antiquity"),
    new TimelinePeriod([500], [1453], "Middle Ages"),
    new TimelinePeriod([1400], [1600], "Renaissance"),
    new TimelinePeriod([1418], [1620], "Age of Discovery", 1),
    // new TimelinePeriod([1600], [1850], "Age of Sail", 1),
    // new TimelinePeriod([1600], [1750], "Baroque Period"),
    new TimelinePeriod([1517], [1648], "Protestant Reformation"),
    new TimelinePeriod([1760], [1840], "First Industrial Revolution"),
    new TimelinePeriod([1815], [1914], "Pax Britannica"),
    new TimelinePeriod([1840], [1914], "Second Industrial Revolution"),
    new TimelinePeriod([1880], [1914], "Belle Époque"),
    new TimelinePeriod([1914], [1918], "World War I"),
    new TimelinePeriod([1929], [1939], "Great Depression"),
    new TimelinePeriod([1939], [1945], "World War II"),
    new TimelinePeriod([1945], [1991], "Cold War Era"),
    new TimelinePeriod([1991], [2024], "Post-Cold War Era"),
];