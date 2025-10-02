import { SurveyConfig, TaskData, File } from './types';
import { systemPrompt } from '@/utils/promts';

export const SURVEY_CONFIGS: SurveyConfig[] = [
    {
        id: 'hints',
        name: 'Undersøkelse A',
        description: 'AI-assistenten vil gi hint og veiledning for å hjelpe deg løse problemer steg for steg.',
        aiEnabled: true,
        systemPrompt: systemPrompt
    },
    {
        id: 'solutions',
        name: 'Undersøkelse B',
        description: 'AI-assistenten vil gi direkte løsninger og kode når du ber om hjelp.',
        aiEnabled: true,
    },
    {
        id: 'terminal',
        name: 'Undersøkelse C',
        description: 'Ingen AI-assistanse - kun standard Python-feilmeldinger og terminalutskrift.',
        aiEnabled: false,
    }
];

export const TASKS: TaskData[] = [
    {
        title: 'Oppgave 1: Variabelskygge',
        md: `# Oppgave 1: Fiks variabelskygge

Koden nedenfor har en variabel som skygger en innebygd Python-funksjon, noe som forårsaker en feil.

**Ditt mål:** Fiks koden slik at den filtrerer ord lengre enn 3 tegn korrekt.

**Forventet utskrift:** ['tool', 'python']
`,
        main: `
# Funksjonen nedenfor skal filtrere ord lengre enn 3 tegn.
def get_word_count_and_filter(word_list):
    len = 0
    long_words = []
    for word in word_list:
        if len(word) > 3:
            long_words.append(word)
    return long_words

print(get_word_count_and_filter(["a", "tool", "bee", "python"]))
# Forventet utskrift: ['tool', 'python']`,
        verify: (out: string) => out.includes("['tool', 'python']") || out.includes('["tool", "python"]')
    },
    {
        title: 'Oppgave 2: Indeks utenfor område',
        md: `# Oppgave 2: Fiks indeksfeil

Funksjonen nedenfor skal sjekke for tilstøtende like verdier, men har en indekseringsfeil.

**Ditt mål:** Fiks området i løkken for å unngå IndexError.

**Forventet utskrift:** 1 (for testtilfelle [1,2,2,3])
`,
        main: `

# Funksjonen nedenfor skal sjekke og skrive ut antall tilstøtende like verdier.
def has_adjacent_duplicate(items):
    adjacent_duplicates = []
    for i in range(len(items)):
        if items[i] == items[i + 1]:
            adjacent_duplicates.append(items[i])
    return len(adjacent_duplicates)

print(has_adjacent_duplicate([1,2,2,3]))
# Forventet utskrift: 1
`,
        verify: (out: string) => out.trim().endsWith('1')
    },
    {
        title: 'Oppgave 3: Variabelområdeproblem',
        md: `# Oppgave 3: Fiks variabelområde

Funksjonen skal telle vokaler i hvert ord separat, men har et områdeproblem.

**Ditt mål:** Fiks variabelinitialiseringen for å telle vokaler per ord korrekt.

**Forventet utskrift:** [1, 1] (for "cat" og "python")
`,
        main: `def count_vowels_per_word(words):
    vowels = "aeiou"
    counts = []
    vowel_count = 0     
    for word in words:
        for char in word.lower():
            if char in vowels:
                vowel_count += 1
        counts.append(vowel_count)
    return counts

print(count_vowels_per_word(["cat", "python"]))
Forventet utskrift: [1, 1]`,
        verify: (out: string) => out.includes('[1, 1]')
    },
    {
        title: 'Oppgave 4: Logikkfeil',
        md: `# Oppgave 4: Fiks logikkfeil

Passordvalideringen bruker feil logisk operator.

**Ditt mål:** Fiks betingelsen for å kreve BÅDE lengde >= 8 OG inneholder et siffer.

**Forventet utskrift:** 
False
True
`,
        main: `
# Funksjonen nedenfor skal sjekke om passordet inneholder et siffer og har en lengde på minst 8.
def has_digit(s):
    return any(char.isdigit() for char in s)

def is_valid_password(password):
    if len(password) >= 8 or has_digit(password):
        return True
    else:
        return False
print(is_valid_password("secret_password"))
print(is_valid_password("secret_password123"))
# Forventet utskrift: False
# Forventet utskrift: True`,
        verify: (out: string) => {
            const lines = out.trim().split('\n');
            return lines.length >= 2 && lines[lines.length - 2].trim() === 'False' && lines[lines.length - 1].trim() === 'True';
        }
    }
];

export const EXPLORATION_FILES: File[] = [
    {
        name: 'explore.py',
        content: `# Utforsk editoren fritt og prøv forskjellig Python-kode!
# Test AI-assistenten (hvis tilgjengelig) eller bare eksperimenter med koding.

def hilsen(navn):
    return f"Hei, {navn}!"

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Prøv å kjøre denne koden og eksperimenter med endringer
print(hilsen("Deltaker"))
print("Fibonacci-sekvens:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`,
        language: 'python'
    },
    {
        name: 'notes.md',
        content: `# Utforskningsnotater

Bruk gjerne dette området til å:
- Prøve forskjellige kodeoppgaver
- Teste AI-assistenten (hvis tilgjengelig)
- Eksperimentere med editorfunksjonene
- Ta notater om din opplevelse

## Funksjoner å utforske:
- Koderedigering og syntaksutheving
- Kjøring av Python-kode
- Filhåndtering (opprett/rediger/slett filer)
- AI-assistent-interaksjoner (hvis tilgjengelig)
- Terminalutskrift

Du kan navigere gjennom appen etter det endelige spørreskjemaet.
`,
        language: 'markdown'
    }
];

export const NAVIGATION_FILES: File[] = [
    {
        name: 'welcome.py',
        content: `# Velkommen til fri navigasjonsfase!
# Du kan nå utforske alle sider i applikasjonen.

# Prøv å besøke forskjellige sider:
# - Dashboard (hjem)
# - Editor (nåværende side)
# - Prosjekter
# - Forslag  
# - Ressurser

print("Velkommen til fri navigasjonsfase!")
print("Utforsk gjerne alle funksjoner i applikasjonen.")
print("Besøk forskjellige sider ved å bruke navigasjonslinjen.")
`,
        language: 'python'
    }
];

export const TIMER_LIMITS = {
    TASK: 420, // 7 minutter
    NAVIGATE: 60, // 10 minutter
} as const;
