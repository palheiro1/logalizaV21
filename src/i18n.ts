import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const translations = {
  en: {
    translation: {
      placeholder: "Comarca...",
      guess: "Guess",
      share: "Share",
      showOnGoogleMaps: "👀 on Google Maps",
      showOnWikipedia: "📚 on Wikipedia",
      welldone: "Well done!",
      unknownCountry: "Comarca desconhecida!",
      copy: "Copied results to clipboard",
      showCountry: "🗺️ Show map!",
      cancelRotation: "🌀 Cancel rotation",
      settings: {
        title: "Settings",
        distanceUnit: "Unit of distance",
        theme: "Theme",
        language: "Language",
        difficultyModifiers: "Difficulty modifiers",
        startingNextDay: "Starting the next day!",
        noImageMode: "Hide country image for more of a challenge.",
        rotationMode: "Randomly rotate country image.",
        updateNotificationDisabled: "Disable update notifications.",
        showScale: "Replace proximity percent by size percent.",
      },
      stats: {
        title: "Statistics",
        played: "Played",
        win: "Win %",
        currentStreak: "Current Streak",
        maxStreak: "Max Streak",
        averageBestDistance: "Best Distances Average",
        guessDistribution: "Guess distribution:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "App Install:",
        description: "Add Worldle to Home Screen to play it easily!",
        instructionTitle: "Instructions:",
        instructionActionOk: "OK",
        instructionActionCancel: "Cancel",
        instructionActionInstall: "Install",
        instructionFirefoxAction1: "- open browser options ",
        instructionFirefoxAction2: "- add to Home Screen",
        instructionFirefoxNewAction1: "- open browser options ",
        instructionFirefoxNewAction2: '- select "Install"',
        instructionIdeviceAction1: "- on Safari, open the Share menu ",
        instructionIdeviceAction2: '- select "Add to Home Screen"',
        instructionOperaAction1: "- press the menu button ",
        instructionOperaAction2: "- add to Home Screen",
        instructionNotSupported: "Not supported by this browser.",
      },
      support: {
        UA: "Apoia o Projecto Estreleira e as Escolas Semente!",
      },
      newVersion: "New version available!",
      update: "Update",
      or: "or",
      ignore: "Ignore",
      buyMeACoffee: "Buy me a ☕!",
      news: {
        newsNotifications: "News notifications system added!",
      },
    },
  },
  fr: {
    translation: {
      placeholder: "Comarca......",
      guess: "Deviner",
      share: "Partager",
      showOnGoogleMaps: "👀 sur Google Maps",
      showOnWikipedia: "📚 sur Wikipedia",
      welldone: "Bien joué !",
      unknownCountry: "Pays inconnu !",
      copy: "Résultat copié !",
      showCountry: "🗺️ Afficher la carte !",
      cancelRotation: "🌀 Annule la rotation",
      settings: {
        title: "Paramètres",
        distanceUnit: "Unité de distance",
        theme: "Thème",
        language: "Langage",
        difficultyModifiers: "Modificateurs de difficulté",
        startingNextDay: "A partir du lendemain !",
        noImageMode: "Cache l'image du pays pour plus de challenge.",
        rotationMode: "Tourne l'image du pays de manière aléatoire.",
        updateNotificationDisabled:
          "Désactive les notification de mise à jour.",
        showScale:
          "Remplace le pourcentage de proximité par le pourcentage de taille.",
      },
      stats: {
        title: "Statistiques",
        played: "Parties",
        win: "Victoires %",
        currentStreak: "Série Actuelle",
        maxStreak: "Série Max",
        averageBestDistance: "Moyenne Meilleures Distances",
        guessDistribution: "Répartitions des victoires:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "Installer l'app:",
        description:
          "Ajouter Worldle sur l'écran d'accueil pour le retrouver plus facilement !",
        instructionTitle: "Instructions :",
        instructionActionOk: "OK",
        instructionActionCancel: "Annuler",
        instructionActionInstall: "Installer",
        instructionFirefoxAction1: "- ouvrir les options du navigateur ",
        instructionFirefoxAction2: "- ajouter à votre écran d'accueil",
        instructionFirefoxNewAction1: "- ouvrir les options du navigateur ",
        instructionFirefoxNewAction2: '- sélectionner "Installer"',
        instructionIdeviceAction1: "- sur Safari, ouvrir le menu de partage ",
        instructionIdeviceAction2: "- sélectionner \"Sur l'écran d'accueil\"",
        instructionOperaAction1: "- appuyer sur le bouton menu ",
        instructionOperaAction2: "- ajouter à l'écran d'accueil",
        instructionNotSupported: "Impossible sur ce navigateur.",
      },
      support: {
        UA: "Soutenez la Croix Rouge Ukrainienne",
      },
      newVersion: "Nouvelle version disponible !",
      update: "Mettre à jour",
      or: "ou",
      ignore: "Ignorer",
      buyMeACoffee: "Offrez moi un ☕ !",
      news: {},
    },
  },
  es: {
    translation: {
      placeholder: "Comarca......",
      guess: "Adivinhar",
      share: "Compartir",
      showOnGoogleMaps: "👀 en Google Maps",
      welldone: "Parabéns !",
      unknownCountry: "Comarca desconocida !",
      copy: "Resultado copiado !",
      showCountry: "🗺️ mostrar mapa !",
      cancelRotation: "🌀 Anular la rotacíon",
      settings: {
        title: "Parámetros",
        distanceUnit: "Unidad de distancia",
        theme: "Tema",
        difficultyModifiers: "Modificador de dificultad",
        startingNextDay: "A partir de mañana!",
        noImageMode: "Oculte la imagen del país para un mayor desafío.",
        rotationMode: "Gira la imagen del país aleatoriamente.",
      },
      stats: {
        title: "Estadísticas",
        played: "Jugadas",
        win: "Ganadas %",
        currentStreak: "Serie Actual",
        maxStreak: "Serie Max",
        averageBestDistance: "Mejor distancia media",
        guessDistribution: "Distribución de aciertos:",
      },
      buyMeACoffee: "Ofrézcame un ☕ !",
    },
  },
  eu: {
    translation: {
      placeholder: "Eskualdea...",
      guess: "Asmatu",
      share: "Elkarbanatu",
      showOnGoogleMaps: "👀 Google Maps-en",
      showOnWikipedia: "📚 Megtekintés Wikipédián",
      welldone: "Ongi egina !",
      unknownCountry: "Estatu ezezaguna !",
      copy: "Emaitzak arbelean kopiatuta !",
      showCountry: "🗺️ Erakutsi mapan !",
      cancelRotation: "🌀 Ezeztatu errotazioa",
      settings: {
        title: "Aukerak",
        distanceUnit: "Distantzia unitateak",
        theme: "Gaia",
        difficultyModifiers: "Zailtasun aldagaiak",
        startingNextDay: "Aldaketak bihartik aurrera ikusgai!",
        noImageMode: "Ezkutatu herriaren irudia zailagoa egiteko.",
        rotationMode: "Errotatu ausaz herrialdearen irudia.",
      },
      stats: {
        title: "Estatistikak",
        played: "Jokatuta",
        win: "Irabaziak %",
        currentStreak: "Uneko seriea",
        maxStreak: "Serie Max",
        averageBestDistance: "Batazbesteko distantzia onenea",
        guessDistribution: "Asmatze banaketa:",
      },
      buyMeACoffee: "☕ bat eskaini iezaidazu !",
    },
  },
  hu: {
    translation: {
      placeholder: "Ország, terület...",
      guess: "Tippelés",
      share: "Megosztás",
      showOnGoogleMaps: "👀 Google Maps-en",
      welldone: "Szép munka!",
      unknownCountry: "Ismeretlen ország!",
      countryDuplication: "Már tippelted ezt az országot!",
      copy: "Eredmény kimásolva vágólapra",
      showCountry: "🗺️ Mutasd a térképet!",
      cancelRotation: "🌀 Elforgatás kikapcsolása",
      settings: {
        title: "Beállítások",
        distanceUnit: "Távolság mértékegysége",
        theme: "Téma",
        difficultyModifiers: "Nehézségi beállítások",
        startingNextDay: "A holnapi naptól!",
        noImageMode: "Vaktérkép elrejtése.",
        rotationMode: "Vaktérkép véletlenszerű elforgatása.",
      },
      stats: {
        title: "Statisztikák",
        played: "Játszott",
        win: "Eltalált %",
        currentStreak: "Jelenlegi Streak",
        maxStreak: "Max Streak",
        averageBestDistance: "Legközelebbi tippek átlaga",
        guessDistribution: "Találatok eloszlása:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "App Letöltése:",
        description:
          "Add hozzá a Worldle a Kezdőképernyőhöz, hogy egyszerűbben játszhass!",
        instructionTitle: "In",
        instructionActionOk: "OK",
        instructionActionCancel: "Mégse",
        instructionActionInstall: "Telepítés",
        instructionFirefoxAction1: "- nyisd meg a böngésző beállításokat ",
        instructionFirefoxAction2: "- hozzáadás Kezdőképernyőhöz",
        instructionFirefoxNewAction1: "- nyisd meg a böngésző beállításokat ",
        instructionFirefoxNewAction2: '- válaszd a "Telepítés"-t',
        instructionIdeviceAction1: "- nyisd meg a megosztás menüt ",
        instructionIdeviceAction2:
          '- válaszd a "Hozzáadás Főképernyőhöz" menüpontot',
        instructionOperaAction1: "- nyisd meg a főmenüt ",
        instructionOperaAction2: "- hozzáadás Főképernyőhöz",
        instructionNotSupported: "Nem támogatott böngészőt használsz!",
      },
      support: {
        UA: "Ukrán Vöröskereszt támogatása",
      },
      buyMeACoffee: "Vegyél nekem egy ☕-t!",
    },
  },
  nl: {
    translation: {
      placeholder: "land, gebied...",
      guess: "Raden",
      share: "Delen",
      showOnGoogleMaps: "👀 op Google Maps",
      showOnWikipedia: "📚 op Wikipedia",
      welldone: "Goed gedaan!",
      unknownCountry: "Onbekend land!",
      copy: "Resultaten zijn naar het klembord gekopiëerd",
      showCountry: "🗺️ Toon kaart!",
      cancelRotation: "🌀 Stop met draaien",
      settings: {
        title: "Instellingen",
        distanceUnit: "Afstandseenheid",
        theme: "Thema",
        difficultyModifiers: "Moeilijkheidsgraad instellen",
        startingNextDay: "Begint de volgende dag!",
        noImageMode: "Verberg de landkaart voor een grotere uitdaging.",
        rotationMode: "Draai de landkaart willekeurig.",
      },
      stats: {
        title: "Statistieken",
        played: "Gespeeld",
        win: "Gewonnen %",
        currentStreak: "Huidige Reeks",
        maxStreak: "Grootste Reeks",
        averageBestDistance: "Beste Afstanden Gemiddelde",
        guessDistribution: "Kansverspreiding:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "Appinstallatie:",
        description:
          "Voeg Worldle toe aan je beginscherm om het makkelijk te spelen!",
        instructionTitle: "Instructies:",
        instructionActionOk: "OK",
        instructionActionCancel: "Annuleer",
        instructionActionInstall: "Installeer",
        instructionFirefoxAction1: "- open browserinstellingen ",
        instructionFirefoxAction2: "- voeg to aan beginscherm",
        instructionFirefoxNewAction1: "- open browserinstellingen ",
        instructionFirefoxNewAction2: '- selecteer "Installeren"',
        instructionIdeviceAction1: "- op Safari, open het deelmenu ",
        instructionIdeviceAction2: '- select "Zet in beginscherm"',
        instructionOperaAction1: "- drop op de menuknop ",
        instructionOperaAction2: "- voeg to aan beginscherm",
        instructionNotSupported: "Niet ondersteund door deze browser.",
      },
      support: {
        UA: "Support het Oekraïense Rode Kruis",
      },
      newVersion: "Nieuwe versie beschikbaar! <br/> Klik hier om te updaten!",
      buyMeACoffee: "Koop een kop ☕ voor me!",
    },
  },
  pl: {
    translation: {
      placeholder: "Kraj, terytorium...",
      guess: "Zgadnij",
      share: "Udostępnij",
      showOnGoogleMaps: "👀 w Google Maps",
      showOnWikipedia: "📚 na Wikipedii",
      welldone: "Gratulacje!",
      unknownCountry: "Nieznane państwo!",
      copy: "Skopiowano wyniki do schowka",
      showCountry: "🗺️ Pokaż mapę!",
      cancelRotation: "🌀 Anuluj obrót",
      settings: {
        title: "Ustawienia",
        distanceUnit: "Jednostka odległości",
        theme: "Motyw",
        language: "Język",
        difficultyModifiers: "Modyfikatory trudności",
        startingNextDay: "Zaczną działać następnego dnia!",
        noImageMode: "Ukryj obrazek kraju dla większego wyzwania.",
        rotationMode: "Obróć losowo obrazek kraju.",
        updateNotificationDisabled: "Wyłącz powiadomienia o aktualizacjach.",
      },
      stats: {
        title: "Statystyki",
        played: "Gry",
        win: "% Wygranych",
        currentStreak: "Aktualny Rekord",
        maxStreak: "Maks. Rekord",
        averageBestDistance: "Średnia Najlepszych Odległości",
        guessDistribution: "Podział odgadnięć:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "Instalacja:",
        description: "Dodaj Worldle do ekranu głównego żeby grać łatwiej!",
        instructionTitle: "Instrukcja:",
        instructionActionOk: "OK",
        instructionActionCancel: "Anuluj",
        instructionActionInstall: "Instaluj",
        instructionFirefoxAction1: "- otwórz ustawienia przeglądarki ",
        instructionFirefoxAction2: "- dodaj do ekranu głównego",
        instructionFirefoxNewAction1: "- otwórz ustawienia przeglądarki ",
        instructionFirefoxNewAction2: '- wybierz "Instaluj"',
        instructionIdeviceAction1: "- na Safari, otwórz menu Udostępnianie ",
        instructionIdeviceAction2: '- wybierz "Dodaj do ekranu głównego"',
        instructionOperaAction1: "- wciśnij przycisk menu ",
        instructionOperaAction2: "- dodaj do ekranu głównego",
        instructionNotSupported: "Brak wsparcia przez przeglądarkę.",
      },
      support: {
        UA: "Wesprzyj Ukraiński Czerwony Krzyż",
      },
      newVersion: "Dostępna nowsza wersja!",
      update: "Aktualizuj",
      or: "albo",
      ignore: "Pomiń",
      buyMeACoffee: "Postaw mi ☕!",
      news: {
        newsNotifications: "Dodano system powiadomień o nowościach!",
      },
    },
  },
  pt: {
    translation: {
      placeholder: "Comarca...",
      guess: "Adivinhar",
      share: "Compartilhar",
      showOnGoogleMaps: "👀 no Google Maps",
      showOnWikipedia: "📚 no Wikipedia",
      welldone: "Parabéns!",
      unknownCountry: "Comarca desconhecida!",
      copy: "Resultados copiados",
      showCountry: "🗺️ Mostrar mapa!",
      cancelRotation: "🌀 Cancelar rotação",
      settings: {
        title: "Configurações",
        distanceUnit: "Unidade de distância",
        theme: "Tema",
        language: "Idioma",
        difficultyModifiers: "Modificadores de dificuldade",
        startingNextDay: "A partir de amanhã!",
        noImageMode: "Esconder imagem do país para maior dificuldade.",
        rotationMode: "Rotacionar imagem do país randomicamente.",
        updateNotificationDisabled: "Desativar notificações.",
        showScale:
          "Substitua percentual de proximidade por percentual de tamanho.",
      },
      stats: {
        title: "Estatísticas",
        played: "Partidas",
        win: "Vitórias %",
        currentStreak: "Sequência atual",
        maxStreak: "Maior sequência",
        averageBestDistance: "Melhor média de distância",
        guessDistribution: "Distribuição de palpites:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "Instalar App:",
        description:
          "Adicione Worldle a sua página inicial para jogar mais facilmente!",
        instructionTitle: "Instruções:",
        instructionActionOk: "OK",
        instructionActionCancel: "Cancelar",
        instructionActionInstall: "Instalar",
        instructionFirefoxAction1: "- abrir opções do navegador ",
        instructionFirefoxAction2: "- adicionar a página inicial",
        instructionFirefoxNewAction1: "- abrir opções do navegador ",
        instructionFirefoxNewAction2: '- selecionar "Instalar"',
        instructionIdeviceAction1: "- no Safari, abrir menu Compartilhar ",
        instructionIdeviceAction2: '- selecionar "Adicione a página inicial"',
        instructionOperaAction1: "- pressionar o botão de menu ",
        instructionOperaAction2: "- adicionar a pagina inicial",
        instructionNotSupported: "Não suportado neste navegador.",
      },
      support: {
        UA: "Apoia o Projecto Estreleira e as Escolas Semente!",
      },
      newVersion: "Nova versão disponível!",
      update: "Atualizar",
      or: "ou",
      ignore: "Ignorar",
      buyMeACoffee: "Pague-me um ☕!",
      news: {
        newsNotifications: "Adicionado sistema de novidades!",
      },
    },
  },
  de: {
    translation: {
      placeholder: "Land, Territorium...",
      guess: "Raten",
      share: "Teilen",
      showOnGoogleMaps: "👀 auf Google Maps",
      showOnWikipedia: "📚 auf Wikipedia",
      welldone: "Sehr gut!",
      unknownCountry: "Unbekanntes Land!",
      copy: "Ergebnis in Zwischenablage kopiert!",
      showCountry: "🗺️ Karte zeigen!",
      cancelRotation: "🌀 Rotation abbrechen",
      settings: {
        title: "Einstellungen",
        distanceUnit: "Entfernungseinheit",
        theme: "Thema",
        language: "Sprache",
        difficultyModifiers: "Schwierigkeits Einstellungen",
        startingNextDay: "Effektiv ab nächstem Tag!",
        noImageMode: "Umriss verbergen für eine größere Herausforderung.",
        rotationMode: "Umrisse zufällig drehen.",
        updateNotificationDisabled: "Update Benachrichtigung deaktivieren.",
        showScale: "Prozentuale Größe anstelle von prozentualer Entfernung.",
      },
      stats: {
        title: "Statistiken",
        played: "Gespielt",
        win: "Gewonnen %",
        currentStreak: "Aktuelle Gewinnserie",
        maxStreak: "Längste Gewinnserie",
        averageBestDistance: "Mittelwert beste Entfernung",
        guessDistribution: "Verteilung der Versuche:",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "App Installieren:",
        description:
          "Worldle zum Startbildschirm hinzufügen um einfacher zu spielen!",
        instructionTitle: "Anleitung:",
        instructionActionOk: "OK",
        instructionActionCancel: "Abbrechen",
        instructionActionInstall: "Installieren",
        instructionFirefoxAction1: "- Browser Einstellungen öffnen ",
        instructionFirefoxAction2: "- Zum Startbildschirm hinzufügen",
        instructionFirefoxNewAction1: "- Browser Einstellungen öffnen ",
        instructionFirefoxNewAction2: '- "Installieren" auswählen',
        instructionIdeviceAction1: "- mit Safari, öffne das Teilen-Menü ",
        instructionIdeviceAction2: '- wähle "Zum Startbildschirm hinzufügen"',
        instructionOperaAction1: "- den Menüknopf drücken ",
        instructionOperaAction2: "- Zum Startbildschirm hinzufügen",
        instructionNotSupported: "Von diesem Browser nicht unterstützt",
      },
      support: {
        UA: "Unterstütze das Ukrainische Rote Kreuz",
      },
      newVersion: "Neue Version verfügbar!",
      update: "Update",
      or: "oder",
      ignore: "Ignorieren",
      buyMeACoffee: "Kauf mir einen ☕!",
      news: {
        newsNotifications: "Neuigkeiten Benachrichtigungssytem hinzugefügt!",
      },
    },
  },
  ja: {
    translation: {
      placeholder: "国名、地域名",
      guess: "回答する",
      share: "シェア",
      showOnGoogleMaps: "👀 Google マップで見る",
      showOnWikipedia: "📚 Wikipediaで見る",
      welldone: "正解です！",
      unknownCountry: "その国名、地域名は無効です",
      copy: "結果をクリップボードにコピーしました",
      showCountry: "🗺️ 地図を表示する",
      cancelRotation: "🌀 地図の回転を元に戻す",
      settings: {
        title: "設定",
        distanceUnit: "距離の単位",
        theme: "テーマ",
        language: "言語",
        difficultyModifiers: "難易度調整",
        startingNextDay: "適用されるのは明日からです",
        noImageMode: "地図を表示しないで挑戦する",
        rotationMode: "地図をランダムに回転させる",
        updateNotificationDisabled: "更新通知を無効にする",
        showScale: "距離の近さ（%）の代わりに国土面積の違い（%）を表示する",
      },
      stats: {
        title: "統計",
        played: "プレイ数",
        win: "的中率（%）",
        currentStreak: "現在の連続的中数",
        maxStreak: "最大連続的中数",
        averageBestDistance: "最も正解に近い回答までの距離の平均",
        guessDistribution: "的中までの回答数",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "アプリをインストール",
        description: "ホーム画面にWorldleを追加してプレイしやすくしましょう！",
        instructionTitle: "やり方",
        instructionActionOk: "OK",
        instructionActionCancel: "キャンセル",
        instructionActionInstall: "インストール",
        instructionFirefoxAction1: "- ブラウザのメニューを開きます",
        instructionFirefoxAction2: "- ホーム画面に追加します",
        instructionFirefoxNewAction1: "- ブラウザのメニューを開きます",
        instructionFirefoxNewAction2: "- 「インストール」を選択します",
        instructionIdeviceAction1: "- Safariでは、シェアメニューを開きます",
        instructionIdeviceAction2: "- 「ホーム画面に追加」を選択します",
        instructionOperaAction1: "- メニューボタンを押します",
        instructionOperaAction2: "- ホーム画面に追加します",
        instructionNotSupported: "このブラウザではご利用いただけません。",
      },
      support: {
        UA: "ウクライナ赤十字社を支援する",
      },
      newVersion: "新しいバージョンが利用できます！",
      update: "アップデート",
      or: "または",
      ignore: "スキップ",
      buyMeACoffee: "☕ コーヒー1杯分をサポート！",
      news: {
        newsNotifications: "ニュース通知が実装されました！",
      },
    },
  },
  co: {
    translation: {
      placeholder: "Paese o territoriu…",
      guess: "Induvinà",
      share: "Sparte",
      showOnGoogleMaps: "👀 nant’à Google Maps",
      showOnWikipedia: "📚 nant’à Wikipedia",
      welldone: "Bellu colpu !",
      unknownCountry: "Paese scunnisciutu !",
      copy: "Risultati cupiati in u preme’papei",
      showCountry: "🗺️ Affissà a cartugrafia !",
      cancelRotation: "🌀 Annullà a rutazione",
      settings: {
        title: "Preferenze",
        distanceUnit: "Unità di distanza",
        theme: "Tema",
        language: "Lingua",
        difficultyModifiers: "Mudificatori di sforzu",
        startingNextDay: "Principiu à u lindumane !",
        noImageMode: "Piatta a fiura di u paese per più di cumpetizione.",
        rotationMode: "Face girà à l’azardu a fiura di u paese.",
        updateNotificationDisabled:
          "Disattiveghja e mudificazioni di messa à livellu.",
        showScale:
          "Rimpiazzeghja u percentuale di vicinanza da quellu di dimensione.",
      },
      stats: {
        title: "Statistiche",
        played: "Partite ghjucate",
        win: "% di vittorie",
        currentStreak: "Seria attuale",
        maxStreak: "Seria massima",
        averageBestDistance: "Mediana di e più belle distanze",
        guessDistribution: "Classificazione di e vittorie",
      },
      install: {
        title: "Worldle",
        descritpionTitle: "Installà l’appiecazione :",
        description:
          "Aghjunghje Worldle à u screnu d’accolta per ghjucà più prestu !",
        instructionTitle: "Istruzzioni :",
        instructionActionOk: "Vai",
        instructionActionCancel: "Abbandunà",
        instructionActionInstall: "Installà",
        instructionFirefoxAction1: "- apre l’ozzioni di u navigatore ",
        instructionFirefoxAction2: "- aghjunghje à u screnu d’accolta",
        instructionFirefoxNewAction1: "- apre l’ozzioni di u navigatore ",
        instructionFirefoxNewAction2: "- selezziunà « Installà »",
        instructionIdeviceAction1:
          "- nant’à Safari, apre u listinu di spartimentu ",
        instructionIdeviceAction2:
          "- selezziunà « Aghjunghje à u screnu d’accolta »",
        instructionOperaAction1: "- appughjà nant’à u buttone di listinu ",
        instructionOperaAction2: "- aghjunghje à u screnu d’accolta",
        instructionNotSupported: "Impussibule nant’à stu navigatore.",
      },
      support: {
        UA: "Sustenite a Croce Rossa Ucraniana",
      },
      newVersion: "Nova versione dispunibule !",
      update: "Mette à livellu",
      or: "o",
      ignore: "Ignurà",
      buyMeACoffee: "Rigalatemi d’un ☕ !",
      news: {
        newsNotifications: "Aghjuntu di u sistema di nutificazione !",
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    compatibilityJSON: 'v3',
    resources: translations,
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: "en",
  });

export default i18n;