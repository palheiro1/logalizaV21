type ListagemLigazonsType = {
  [key: string]: {
    [key: number]: string;
  };
};

const listagemLigazons: ListagemLigazonsType = {
  ancares: {
    1: "https://estreleira.gal/ancares",
    2: "https://gl.wikipedia.org/wiki/O_Mustallar",
    3: "https://praza.gal/movementos-sociais/cando-habia-pitas-do-monte-nos-ancares-e-fraga-as-cazaba",
    4: "https://gl.wikipedia.org/wiki/Palloza",
    5: "https://gl.wikipedia.org/wiki/San_Rom%C3%A1n_de_Cervantes,_Cervantes",
    6: "https://www.becerrea.net/portal/becerrea-rememorou-este-fin-de-semana-heroica-resistencia-na-ponte-de-cruzul"
  },
  arcua: {
    1: "https://estreleira.gal/arcua",
    2: "https://gl.m.wikipedia.org/wiki/R%C3%ADo_Ulla",
    3: "https://gl.wikipedia.org/wiki/Queixo_de_Arz%C3%BAa-Ulloa",
    4: "http://patrimoniogalego.net/index.php/32663/2013/01/capela-da-madalena-3/",
    5: "https://gl.wikipedia.org/wiki/Boimorto",
    6: "https://www.nosdiario.gal/articulo/social/loita-vecinal-consigue-enterrar-proxecto-da-mina-touro-pino/20200128205902090352.html"
  },
  arnoia: {
    1: "https://estreleira.gal/arnoia",
    2: "https://blog.turismo.gal/destinos-gl/de-paseo-por-allariz-parque-etnografico-do-rio-arnoia/",
    3: "https://felosdemaceda.com/",
    4: "https://balneariosdegalicia.gal/os-balnearios/balneario-de-banos-de-molgas/",
    5: "https://gl.wikipedia.org/wiki/Ni%C3%B1odaguia,_Xunqueira_de_Espadanedo",
    6: "https://praza.gal/movementos-sociais/25-anos-da-revolta-de-allariz"
  },
  baixalimia: {
    1: "https://estreleira.gal/baixalimia",
    2: "https://gl.wikipedia.org/wiki/Baixa_Limia_-_Serra_do_Xur%C3%A9s",
    3: "https://orgullogalego.gal/vaca-cachena/",
    4: "http://www.aquisquerquennis.es/gl/o-campamento-romano-un-pouco-de-historia/",
    5: "https://gl.wikipedia.org/wiki/Entrimo",
    6: "https://milhistorias.eu/asolagados-e-os-dias-afogados-nos-encoros-de-belesar-e-lindoso/"
  },
  baixominho: {
    1: "https://estreleira.gal/baixominho",
    2: "https://www.turismoaguarda.es/gl/estuario-del-mino//",
    3: "https://gl.wikipedia.org/wiki/Festa_do_Monte",
    4: "https://www.mosteirodeoia.com/gl/",
    5: "https://gl.wikipedia.org/wiki/Oia",
    6: "https://gl.wikipedia.org/wiki/M%C3%A1rtires_de_Sobredo"
  },
  barbanca: {
    1: "https://estreleira.gal/barbanca",
    2: "https://gl.wikipedia.org/wiki/Praia_das_Furnas",
    3: "https://www.gciencia.com/gastro/a-xouba-de-rianxo-delicatessen-de-antiga-tradicion/",
    4: "https://omarfeitotradicion.gal/castelodalua",
    5: "https://gl.wikipedia.org/wiki/A_Pobra_do_Carami%C3%B1al",
    6: "https://www.nosdiario.gal/articulo/memoria/nebra-labregas-abusos-do-estado/20211011211247130421.html"
  },
  bergantinhos: {
    1: "https://estreleira.gal/bergantinhos",
    2: "https://gl.wikipedia.org/wiki/Praia_dos_Cristais",
    3: "https://www.concellomalpica.com/turismo/gl/festas/festas-do-mar/",
    4: "https://www.concellomalpica.com/turismo/gl/a-vila/porto/",
    5: "https://gl.wikipedia.org/wiki/Bu%C3%B1o,_Malpica_de_Berganti%C3%B1os",
    6: "https://www.nosdiario.gal/articulo/memoria/baldaio-loita-moi-custosa-mais-mereceu-pena/20200507230147097177.html"
  },
  berzo: {
    1: "https://estreleira.gal/berzo",
    2: "https://gl.wikipedia.org/wiki/As_M%C3%A9dulas",
    3: "https://gl.wikipedia.org/wiki/Botelo",
    4: "https://historiadegalicia.gal/2020/03/a-fronteira-entre-galicia-e-bierzo-perde-outra-palloza-nun-dos-conxuntos-mais-excepcionais-dos-ancares/",
    5: "https://gl.wikipedia.org/wiki/A_Veiga_de_Valcarce",
    6: "https://luzes.gal/05/07/2022/seccions-da-revista-luzes/reportaxes/libertad-aurora-e-as-mulleres-da-mina/"
  },
  burom: {
    1: "https://estreleira.gal/burom",
    2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Eo",
    3: "http://www.consellodacultura.gal/asg/instrumentos/os-idiofonos/trompa-ou-birimbau/",
    4: "https://terrasdeburon.es/gl/dolmen-e-hospital-de-montouto/",
    5: "https://gl.wikipedia.org/wiki/Negueira_de_Mu%C3%B1iz",
    6: "http://www.afonsagrada.org/info/historia-e-xeografia"
  },
  cabreira: {
    1: "https://estreleira.gal/cabreira",
    2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Cabreira",
    3: "https://www.galizalivre.com/2020/03/17/aguia-a-rainha-das-serras/",
    4: "https://es-m-wikipedia-org.translate.goog/wiki/Canales_romanos_de_Las_M%C3%A9dulas?_x_tr_sl=es&_x_tr_tl=gl&_x_tr_hl=gl&_x_tr_pto=sc",
    5: "https://gl.wikipedia.org/wiki/A_Ponte_de_Domingos_Fl%C3%B3rez",
    6: "https://sputniklabrego.com/2020/03/26/a-ciudad-de-la-selva-na-documentacion-escrita-v-a-muller-na-ciudad-de-la-selva/"
  },
  caldas: {
    1: "https://estreleira.gal/caldas",
    2: "https://vitgal.es/gl/1029/fervenza-de-segade.-caldas-de-reis",
    3: "https://rutasdehistoria.com/queres-conocer-as-augas-sagradas-e-os-tesouros-romanos-de-cuntis/",
    4: "https://www.turismo.gal/recurso/-/detalle/4632/igrexa-parroquial-de-san-martino-de-gargantans?langId=gl_ES&tp=8&ctre=31",
    5: "https://gl.wikipedia.org/wiki/Cuntis",
    6: "https://iscagz.org/xohan-xesus-gonzalez-socialista-e-independentista/"
  },
  carvalhinho: {
    1: "https://estreleira.gal/carvalhinho",
    2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Arenteiro",
    3: "http://www.consellodacultura.gal/asg/instrumentos/os-membranofonos/tambor-feminino/",
    4: "https://gl.wikipedia.org/wiki/Mosteiro_de_Santa_Mar%C3%ADa_de_Oseira",
    5: "https://gl.wikipedia.org/wiki/Bobor%C3%A1s",
    6: "https://gl.wikipedia.org/wiki/Masacre_de_Oseira"
  },
  chantada: {
      1: "https://estreleira.gal/chantada",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Asma",
      3: "https://www.nosdiario.gal/articulo/cultura/folion-carros/20160804185333050073.html",
      4: "http://patrimoniogalego.net/index.php/49911/2013/09/torre-medieval-de-toran/",
      5: "https://gl.wikipedia.org/wiki/Taboada",
      6: "https://praza.gal/movementos-sociais/a-guerrilla-galega-reuniase-nas-casas-non-no-monte",
    },
    condado: {
      1: "https://estreleira.gal/condado",
      2: "http://historiadegalicia.gal/2020/05/a-pena-do-equilibrio-a-dos-namorados-e-os-segredos-dos-apenedados-cumios-do-monte-da-picarana/",
      3: "https://www.youtube.com/watch?v=hA5OoQsPO8o",
      4: "https://gl.wikipedia.org/wiki/Castelo_de_Salvaterra",
      5: "https://gl.wikipedia.org/wiki/As_Neves",
      6: "https://gl.wikipedia.org/wiki/Festival_da_Poes%C3%ADa_no_Condado",
    },
    corunha: {
      1: "https://estreleira.gal/corunha",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Mero",
      3: "https://www.visitcoruna.com/turismo/gl/que-facer-na-coruna/gastronomia/festivais-e-actividades-gastronomicas/festival/san-xoan-festa-de-interese-turistico-internacional/contenido/1453790765996?argIdioma=gl",
      4: "http://patrimoniogalego.net/index.php/2883/2011/07/acueduto-do-paseo-das-pontes/",
      5: "https://gl.wikipedia.org/wiki/Carral",
      6: "https://praza.gal/cultura/anna-turbau-lcando-cheguei-galicia-era-unha-batalla-permanente-non-era-para-nada-un-pobo-pasivor",
    },
    costadamorte: {
      1: "https://estreleira.gal/costadamorte",
      2: "https://gl.wikipedia.org/wiki/Cabo_Touri%C3%B1%C3%A1n",
      3: "https://www.caminodosfaros.com/medioambiente/flora/omphalodes-littoralis-subsp-gallaecica/",
      4: "https://www.quepasanacosta.gal/articulo/zas/conecendo-polo-miudo-a-historia-da-parroquia-de-zas/20171127045744086352.html",
      5: "https://gl.wikipedia.org/wiki/Santa_Comba",
      6: "https://www.nosdiario.gal/articulo/memoria/revolta-popular-esquecida-que-rematou-12-asasinatos-vimianzo/20220705082044147025.html",
    },
    courel: {
      1: "https://estreleira.gal/courel",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Lor",
      3: "https://fr-fr.facebook.com/100447708049406/photos/a.100457391381771/227044458723063/",
      4: "https://www.gciencia.com/destinos/montefurado-tunel-rio-sil/",
      5: "https://gl.wikipedia.org/wiki/Quiroga",
      6: "https://gl.wikipedia.org/wiki/Ux%C3%ADo_Novoneyra",
    },
    deca: {
      1: "https://estreleira.gal/deca",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Deza",
      3: "https://www.biodiversidadedodeza.org/blog/o-desm%C3%A1n-ib%C3%A9rico-na-comarca-do-deza",
      4: "https://www.flickr.com/photos/adrian-deejay/5544581615/in/photostream/",
      5: "https://gl.wikipedia.org/wiki/Silleda",
      6: "https://pt.wikipedia.org/wiki/Xos%C3%A9_Neira_Vilas",
    },
    eume: {
      1: "https://estreleira.gal/eume",
      2: "https://gl.wikipedia.org/wiki/Fragas_do_Eume",
      3: "https://www.rios-galegos.com/anf10.htm#DIBUJO%20DE%20LA%20CHIOGLOSA%20LUSITANICA.",
      4: "https://www.turismo.gal/recurso/-/detalle/19958/santa-maria-de-monfero?langId=gl_ES&ctre=33&tp=8",
      5: "https://gl.wikipedia.org/wiki/As_Pontes_de_Garc%C3%ADa_Rodr%C3%ADguez",
      6: "https://gl.wikipedia.org/wiki/Francisco_Mart%C3%ADnez_Leira",
    },
    limia: {
      1: "https://estreleira.gal/limia",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Limia",
      3: "https://gl.wikipedia.org/wiki/Limi%C3%A1",
      4: "https://historiadexinzo.wordpress.com/2018/10/12/a-torre-de-pena-xinzo-de-limia/",
      5: "https://gl.wikipedia.org/wiki/Rairiz_de_Veiga",
      6: "https://praza.gal/acontece/na-procura-dos-restos-das-martires-de-xinzo-de-limia-asasinadas-en-1937",
    },
    lugo: {
      1: "https://estreleira.gal/lugo",
      2: "http://historiadegalicia.gal/2021/02/as-escavacions-do-castro-de-viladonga-cumpren-medio-seculo-estreando-nova-imaxe/",
      3: "https://www.nosdiario.gal/articulo/reportaxes/fuxan-os-ventos/20220304125659138499.html",
      4: "https://museos-xunta-gal.translate.goog/gl/san-paio-narla?_x_tr_sl=es&_x_tr_tl=gl&_x_tr_hl=gl&_x_tr_pto=sc",
      5: "https://gl.wikipedia.org/wiki/Gunt%C3%ADn",
      6: "https://www.nosdiario.gal/articulo/social/galiza-cota-empresarial/20171129182716063777.html",
    },
    marinha: {
      1: "https://estreleira.gal/marinha",
      2: "https://gl.wikipedia.org/wiki/Cova_do_Rei_Cintolo",
      3: "https://gl.wikipedia.org/wiki/Maruxaina",
      4: "https://www.nosdiario.gal/articulo/social/sargadelos-mais-ceramica/20200812205156103118.html",
      5: "https://gl.wikipedia.org/wiki/Ourol",
      6: "https://www.nosdiario.gal/articulo/memoria/45-anos/20220410182946140711.html",
    },
    marinhas: {
      1: "https://estreleira.gal/marinhas",
      2: "http://www.adelaleiro.com/v/Cat%C3%A1logo-de-descargas/Rutas/R%C3%ADos-Humidais/Adela/Ruta--fervenzas-do-r%C3%ADo-Zarzo--Irixoa-/629.aspx",
      3: "https://gl.wikipedia.org/wiki/Parque_do_Pasatempo",
      4: "http://patrimoniogalego.net/index.php/43526/2013/05/antigo-matadoiro-municipal/",
      5: "https://gl.wikipedia.org/wiki/Betanzos",
      6: "https://praza.gal/opinion/foucelhas-memoria-de-umha-resistencia",
    },
    monterrei: {
      1: "https://estreleira.gal/monterei",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_T%C3%A1mega",
      3: "https://gl.wikipedia.org/wiki/Entroido_de_Laza",
      4: "https://gl.wikipedia.org/wiki/Castelo_de_Monterrei",
      5: "https://gl.wikipedia.org/wiki/Vilardev%C3%B3s",
      6: "http://www.verin.gal/index.php?option=com_content&view=article&id=4420:2018-02-20-10-38-41&catid=1:latest-news&Itemid=61"
  },
  morraco: {
      1: "https://estreleira.gal/morraco",
      2: "https://gl.wikipedia.org/wiki/Costa_da_Vela",
      3: "http://entroidodecobres.com/",
      4: "https://vilaboa.gal/as-salinas-do-ullo/",
      5: "https://gl.wikipedia.org/wiki/Bueu",
      6: "https://pasouoquepasou.crtvg.gal/content/mobilizacions-contra-instalacion-dunha-empacadora-de-residuos-en-vilaboa-en-1997"
  },
  murosnoia: {
      1: "https://estreleira.gal/murosnoia",
      2: "https://gl.wikipedia.org/wiki/Monte_Louro,_Louro,_Muros",
      3: "https://marabaixo.gal/embarcacions-tradicionais-galegas/",
      4: "https://historiadegalicia.gal/2022/07/vilacoba-o-val-no-que-se-esconden-antigas-fabricas-de-papel/",
      5: "https://gl.wikipedia.org/wiki/Outes",
      6: "https://www.nosdiario.gal/articulo/memoria/recuperar-memoria-200-mineiros-da-columna-sanfins/20161027143443052329.html"
  },
  ordes: {
      1: "https://estreleira.gal/ordes",
      2: "https://galiciaambiental.org/gal/galicia-al-natural-ver/o-tambre",
      3: "https://www.nosdiario.gal/articulo/social/parques-eolicos-ameazan-flora-endemica-galega-unica-mundo/20180711113833070553.html",
      4: "https://gl.wikipedia.org/wiki/Dolmen_de_Cabaleiros",
      5: "https://gl.wikipedia.org/wiki/Mes%C3%ADa",
      6: "https://praza.gal/movementos-sociais/as-encrobas-40-anos-dunha-loita-iconica"
  },
  ortegal: {
      1: "https://estreleira.gal/ortegal",
      2: "https://gl.wikipedia.org/wiki/O_Porto_do_Barqueiro%2C_Mogor%2C_Ma%C3%B1%C3%B3n",
      3: "https://praza.gal/cultura/a-peregrinaxe-da-xeracion-nos-a-santo-andre-de-teixido-unha-viaxe-ao-interior-do-pais-contada-dende-hoxe",
      4: "https://www.turismo.gal/recurso/-/detalle/19944/os-dominicos?langId=gl_ES&ctre=34&tp=8",
      5: "https://gl.wikipedia.org/wiki/Santuario_de_Santo_Andr%C3%A9_de_Teixido",
      6: "https://gl.wikipedia.org/wiki/Federico_Maci%C3%B1eira"
  },
  ourense: {
      1: "https://estreleira.gal/ourense",
      2: "https://gl.wikipedia.org/wiki/Os_Peares",
      3: "https://gl.wikipedia.org/wiki/Festa_dos_maios",
      4: "https://gl.wikipedia.org/wiki/Castelo_da_Peroxa",
      5: "https://gl.wikipedia.org/wiki/San_Cibrao_das_Vi%C3%B1as",
      6: "https://www.galizalivre.com/2019/06/27/27-de-junho-de-1931-proclama-se-a-republica-galega/"
  },
  paradanta: {
      1: "https://estreleira.gal/paradanta",
      2: "https://www.turismo.gal/recurso/-/detalle/210512000357/fervenza-do-pozo-do-inferno?langId=gl_ES&tp=40004370",
      3: "https://gl.wikipedia.org/wiki/Lamprea",
      4: "https://www.turismo.gal/recurso/-/detalle/4717/igrexa-monacal-de-santa-maria-da-franqueira?langId=gl_ES&ctre=31&tp=8",
      5: "https://gl.wikipedia.org/wiki/A_Ca%C3%B1iza",
      6: "https://praza.gal/acontece/o-salto-cando-a-mobilizacion-social-de-galicia-e-portugal-paralizou-o-encoro-de-sela"
  },
  pontevedra: {
      1: "https://estreleira.gal/pontevedra",
      2: "https://gl.wikipedia.org/wiki/Parque_da_Natureza_do_R%C3%ADo_Barosa",
      3: "https://www.nosdiario.gal/articulo/social/aventura-salvar-carballo-santa-margarida/20170901154607060932.html",
      4: "https://www.uvigo.gal/universidade/comunicacion/duvi/guia-afonda-orixes-combarro-seu-descubrimento-patrimonio-cultural-galicia",
      5: "https://gl.wikipedia.org/wiki/Combarro,_Poio",
      6: "http://www.galiciaconfidencial.com/noticia/85098-homenaxe-mariscadoras-hai-60-anos-se-opuxeron-chegada-ence-pontevedra-represion-franquista"
  },
  ribeiro: {
      1: "https://estreleira.gal/ribeiro",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Avia",
      3: "http://festadaistoria.com/",
      4: "http://osuido.org/eira-barroso-avion/",
      5: "https://gl.wikipedia.org/wiki/Leiro",
      6: "https://www.nosdiario.gal/articulo/memoria/dia-da-patria-galega-1966/20160724211725049764.html"
  },
  salnes: {
      1: "https://estreleira.gal/salnes",
      2: "https://pandulleiros.blogspot.com/2014/09/salvemos-o-areoso.html?m=1",
      3: "https://cxusto.blogspot.com/2013/10/cambados-vii-un-lugar-fermoso-festas.html?m=0",
      4: "https://www.osalnes.com/gl/descubre/visitas/arquitectura-civil-pazos/telleira-de-seixinos.html",
      5: "https://gl.wikipedia.org/wiki/Ribadumia",
      6: "http://consellodacultura.gal/album-de-galicia/detalle.php?persoa=1319"
  },
  compostela: {
      1: "https://estreleira.gal/compostela",
      2: "https://www.galizalivre.com/2019/05/21/a-galeguidade-e-os-seus-cumios/",
      3: "http://agal-gz.org/blogues/index.php/gent/2010/02/12/texto-da-comissom-d-ecultura-sobre-o-entruido",
      4: "https://www.gciencia.com/destinos/as-pontes-sobre-o-ulla-en-gundian-arte-por-duplicado-para-salvar-unha-xeoloxia-singular/",
      5: "https://gl.wikipedia.org/wiki/A_Ponte_Maceira,_Portor,_Negreira",
      6: "https://gl.wikipedia.org/wiki/Banquete_de_Conxo"
  },
  sarria: {
      1: "https://estreleira.gal/sarria",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Sarria",
      3: "http://historiadegalicia.gal/2019/03/cova-eiros-a-catedral-da-arte-rupestre-galega-xa-e-bic/",
      4: "https://gl.wikipedia.org/wiki/Mosteiro_de_San_Xuli%C3%A1n_de_Samos",
      5: "https://gl.wikipedia.org/wiki/Samos",
      6: "https://gl.wikipedia.org/wiki/Fiz_Vergara_Vilari%C3%B1o"
    },
    seabra: {
      1: "https://estreleira.gal/seabra",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Bibei",
      3: "https://cultura.deputacionlugo.gal/es/centrad/coleccion_instrumentos/formacion/gaita_sabranesa",
      4: "https://gl.wikipedia.org/wiki/Castelo_dos_Condes_de_Benavente",
      5: "https://gl.wikipedia.org/wiki/Porto,_Zamora",
      6: "https://viascruzadas-home-blog.translate.goog/tag/carrilanos-os-tuneles-dun-tempo/?_x_tr_sl=es&_x_tr_tl=gl&_x_tr_hl=gl&_x_tr_pto=sc"
    },
    taveiros: {
      1: "https://estreleira.gal/taveiros",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Ulla",
      3: "https://rapadasbestas.gal/?lang=gl",
      4: "https://turismoriasbaixas.com/gl/recursopan1?content=280380093",
      5: "https://gl.wikipedia.org/wiki/A_Estrada",
      6: "https://bvg.udc.es/ficha_autor.jsp?id=ManGarc%ED&alias=Ken+Keirades&solapa=biografia"
    },
    terracha: {
      1: "https://estreleira.gal/terracha",
      2: "https://pt.m.wikipedia.org/wiki/Pedregal_de_Irimia",
      3: "https://www.crecenteasociados.com/gl/o-carballo-de-luxis-homenaxea-ao-dia-da-arbore",
      4: "https://gl.wikipedia.org/wiki/Castelo_de_Vilalba",
      5: "https://gl.wikipedia.org/wiki/Guitiriz",
      6: "https://www.contraminaccion.org/category/conflitos-mineria-galicia/conflitos-terra-cha/"
    },
    terradecaldelas: {
      1: "https://estreleira.gal/terradecaldelas",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Sil",
      3: "https://gl.wikipedia.org/wiki/Caldel%C3%A1",
      4: "https://pt.wikipedia.org/wiki/Castelo_de_Castro_Caldelas",
      5: "https://gl.wikipedia.org/wiki/Montederramo",
      6: "http://patrimoniogalego.net/index.php/6912/2011/10/castelo-de-castro-caldelas/"
    },
    terradelemos: {
      1: "https://estreleira.gal/terradelemos",
      2: "https://gl.wikipedia.org/wiki/Alto_da_Veneira",
      3: "https://www.g24.gal/-/adegas-da-ribeira-sacra-xa-comezaron-a-vendima-estes-dias",
      4: "https://gl.wikipedia.org/wiki/Ponte_Vella_de_Monforte_de_Lemos",
      5: "https://gl.wikipedia.org/wiki/Belesar,_Chantada",
      6: "https://praza.gal/acontece/1946-o-dia-que-as-mulleres-de-escairon-se-enfrontaron-a-garda-civil-para-protexer-a-sua-colleita"
    },
    terrademelide: {
      1: "https://estreleira.gal/terrademelide",
      2: "https://turismo.marinasbetanzos.gal/rutas/lagoa-de-sobrado/?lang=gl",
      3: "https://www.turismo.gal/recurso/-/detalle/fi-co-000028/festa-do-melindre-e-da-repostaria-tradicional-da-terra?langId=gl_ES",
      4: "https://gl.wikipedia.org/wiki/Mosteiro_de_Santa_Mar%C3%ADa_de_Sobrado_dos_Monxes",
      5: "https://gl.wikipedia.org/wiki/Sobrado",
      6: "https://museodaterrademelide.blogspot.com/2024/09/a-xunta-irmandina-de-melide.html?m=1#more"
    },
    terrademontes: {
      1: "https://estreleira.gal/terrademontes",
      2: "https://pontevedraviva.com/galeria/7177/petroglifos-cerdedo-cotobade/",
      3: "https://gl.wikipedia.org/wiki/Carballeira_de_San_Xusto",
      4: "https://montepituco.com/2018/01/15/embalse-de-eiras/",
      5: "https://gl.wikipedia.org/wiki/Ponte_Caldelas",
      6: "https://consellodacultura.gal/album-de-galicia/detalle.php?persoa=26425"
    },
    terradenaviaeu: {
      1: "https://estreleira.gal/terradenaviaeu",
      2: "https://www.nosdiario.gal/articulo/social/o-rio-eo-faise-mar/20211015135436130672.html",
      3: "http://www.pangalaica.com/britonia/lugares/taramundi.htm",
      4: "https://www-tapiadecasariego-es.translate.goog/index.php?M1=3&M2=72&_x_tr_sl=es&_x_tr_tl=gl&_x_tr_hl=gl&_x_tr_pto=sc",
      5: "https://gl.wikipedia.org/wiki/Tapia_de_Casarego",
      6: "https://gl.wikipedia.org/wiki/Ferm%C3%ADn_Penzol"
    },
    terradetrives: {
      1: "https://estreleira.gal/terradetrives",
      2: "https://gl.wikipedia.org/wiki/Serra_da_Queixa",
      3: "https://www.cultura.gal/gl/evento/93592/549/116682",
      4: "http://historiadegalicia.gal/2016/06/denuncian-o-estado-de-abandono-da-torre-reloxo-de-trives/",
      5: "https://gl.wikipedia.org/wiki/San_Xo%C3%A1n_de_R%C3%ADo",
      6: "https://salvemosomacizo.wordpress.com/"
    },
    ulhoa: {
      1: "https://estreleira.gal/ulhoa",
      2: "https://gl.wikipedia.org/wiki/Monte_Farelo",
      3: "https://biodiversidade.eu/especie/santolina-melidensis-rodr-oubina-aamp-s-ortiz-rodr-oubina-aamp-s-ortiz/?lang=gl&translate=true",
      4: "https://gl.wikipedia.org/wiki/Castelo_de_Pambre",
      5: "https://gl.wikipedia.org/wiki/Monterroso",
      6: "https://www.nosdiario.gal/articulo/social/manifestacion-historica-palas-rei-macrocelulosa-altri/20240526130132198701.html"
    },
    valdeorras: {
      1: "https://estreleira.gal/valdeorras",
      2: "https://gl.wikipedia.org/wiki/Pena_Trevinca",
      3: "https://www.campogalego.gal/cando-comezou-facerse-vino-en-valdeorras/",
      4: "http://centros.edu.xunta.es/ceipcondesadefenosa/bibliocondesa/proxectos/edificios_pdi/pontesanfernando.html",
      5: "https://gl.wikipedia.org/wiki/Rubi%C3%A1",
      6: "https://www.elsaltodiario.com/feminismos/mulleres-base-resistencia-guerrilleira-valdeorras"
    },
    valedoibias: {
      1: "https://estreleira.gal/valedoibias",
      2: "https://gl.wikipedia.org/wiki/R%C3%ADo_Ibias",
      3: "http://www.bodegavc.es/gl/a-vina-en-ibias/",
      4: "https://gl.wikipedia.org/wiki/Palloza",
      5: "https://gl.wikipedia.org/wiki/Santo_Antol%C3%ADn_de_Ibias,_Ibias",
      6: "http://consellodacultura.gal/album-de-galicia/detalle.php?persoa=29805"
  },
  viana: {
      1: "https://estreleira.gal/viana",
      2: "https://historiadegalicia.gal/2019/10/o-penedo-dos-tres-reinos-o-marco-que-dividia-tres-mundos/",
      3: "https://www.diarioliberdade.org/galiza/cultura-m%C3%BAsica/13041-entruido-galego-os-boteiros-de-vilarinho-de-conso.html",
      4: "http://patrimoniogalego.net/index.php/34429/2013/02/torre-de-viana-do-bolo/",
      5: "https://gl.wikipedia.org/wiki/A_Mezquita",
      6: "https://praza.gal/movementos-sociais/a-pasionaria-galega-torturada-asasinada-e-exhibida-nun-carro-de-bois"
  },
  vigo: {
      1: "https://estreleira.gal/vigo",
      2: "https://gl.wikipedia.org/wiki/Serra_do_Gali%C3%B1eiro",
      3: "http://www.omerdeiro.org/",
      4: "https://gl.wikipedia.org/wiki/Faro_de_cabo_Silleiro",
      5: "https://gl.wikipedia.org/wiki/Mos",
      6: "https://www.nosdiario.gal/opinion/manuel-mera/sangue-bagoas-dignidade-rebeldia-loita-foros/20180108205408064905.html"
  },
  trasancos: {
      1: "https://estreleira.gal/trasancos",
      2: "https://www.falamedesansadurnino.org/imaxe/fervenza-do-rio-castro/",
      3: "https://gl.wikipedia.org/wiki/Polbo_%C3%A1_mugardesa",
      4: "https://gl.wikipedia.org/wiki/Castelo_de_Moeche",
      5: "https://gl.wikipedia.org/wiki/San_Sadurni%C3%B1o",
      6: "https://www.nosdiario.gal/articulo/memoria/revoltas-do-pan-naron/20180208132056065874.html"
  }
};

export default listagemLigazons;