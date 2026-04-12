import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ImportUser = {
  email: string;
  apellido: string;
  nombre: string;
  carrera: string;
  dni: string;
  porcentaje_beca: number;
};

const users: ImportUser[] = [
  {
    "dni": "95382311",
    "email": "marceecheverria91@gmail.com",
    "apellido": "Marcela",
    "nombre": "Echeverría",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43087851",
    "email": "metosorestesfilo@gmail.com",
    "apellido": "Orestes",
    "nombre": "Metos",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "47071588",
    "email": "tiarafdezb@gmail.com",
    "apellido": "Tiara",
    "nombre": "Fernandez Bravo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45678876",
    "email": "barrazaemilsemonserrat@gmail.com",
    "apellido": "Emilse Magali Monserrat",
    "nombre": "Barraza",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "46817095",
    "email": "reymguadalupe@gmail.com",
    "apellido": "Guadalupe",
    "nombre": "Rey",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "25131205",
    "email": "hoy_soy_simon@hotmail.com",
    "apellido": "Ricardo Simón",
    "nombre": "Martínez",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "43261857",
    "email": "abril.lara2102@gmail.com",
    "apellido": "Abril",
    "nombre": "Lara",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "35860215",
    "email": "basilisconarciso@gmail.com",
    "apellido": "Violeta",
    "nombre": "Puente",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "16582383",
    "email": "mariarosavalle@gmail.com",
    "apellido": "MARIA ROSA",
    "nombre": "VALLE",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "47454041",
    "email": "almaabrilgiordano@gmail.com",
    "apellido": "Alma",
    "nombre": "Giordano",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "96318857",
    "email": "acaciarodas14@gmail.com",
    "apellido": "Alison",
    "nombre": "Rodas Medrano",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44521111",
    "email": "valenfiordalisi@gmail.com",
    "apellido": "Valentina",
    "nombre": "Fiordalisi",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47232824",
    "email": "ailincalero18@gmail.com",
    "apellido": "Ailín",
    "nombre": "Calero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43093884",
    "email": "ayluguada@gmail.com",
    "apellido": "Aylen",
    "nombre": "Baez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46991379",
    "email": "ludom.2105@gmail.com",
    "apellido": "Lucía Celeste",
    "nombre": "Dominguez Damico",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47347659",
    "email": "renatazunino06@gmail.com",
    "apellido": "Renata",
    "nombre": "Zunino Wroblewski",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47795456",
    "email": "facuarandilla@gmail.com",
    "apellido": "Facundo Leonel",
    "nombre": "Arandilla",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "40541833",
    "email": "malena.rnv@gmail.com",
    "apellido": "Malena",
    "nombre": "Novello",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44880915",
    "email": "agustinaozuna60@gmail.com",
    "apellido": "agustina milagros",
    "nombre": "Ozuna",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "41076959",
    "email": "claraisabelybarra@gmaill.com",
    "apellido": "Clara",
    "nombre": "Ybarra",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "30869155",
    "email": "mimokinson@gmail.com",
    "apellido": "Roberto",
    "nombre": "Bassi",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46098199",
    "email": "malenamerida159@gmail.com",
    "apellido": "Malena",
    "nombre": "Quiroz",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44744683",
    "email": "miaasuadf@gmail.com",
    "apellido": "Mia Yael",
    "nombre": "Asuad Feyen",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "35375332",
    "email": "lourdesbregante@gmail.com",
    "apellido": "Lourdes Natalí",
    "nombre": "Bregante",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "47138905",
    "email": "eb6866622@gmail.com",
    "apellido": "Eliana",
    "nombre": "Blanco",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45518246",
    "email": "lsandez04@gmail.com",
    "apellido": "Ambar",
    "nombre": "Sandez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "17065272",
    "email": "magadefe-180@hotmail.com",
    "apellido": "Maria Gabriela",
    "nombre": "De Ferrari",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43744633",
    "email": "lucianamarina01@gmail.com",
    "apellido": "Luciana Marina",
    "nombre": "Castillo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "37898417",
    "email": "daianamaqueda@gmail.com",
    "apellido": "Daiana Elizabeth",
    "nombre": "Maqueda",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47458249",
    "email": "lucasfleita29@gmail.com",
    "apellido": "Lucas",
    "nombre": "Fleita",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47146831",
    "email": "carolinagalv06@gmail.com",
    "apellido": "Abril Carolina",
    "nombre": "Galván",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43872788",
    "email": "weinbaurconrado@gmail.com",
    "apellido": "Conrado",
    "nombre": "Weinbaur",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44364169",
    "email": "cammila.cg@gmail.com",
    "apellido": "Camila",
    "nombre": "Gimenez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43567584",
    "email": "peippodenapoli@gmail.com",
    "apellido": "Paulo Peippo Lahuel",
    "nombre": "De Napoli",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43785209",
    "email": "natashayaelmaciel248@outlook.com",
    "apellido": "Natasha Yael",
    "nombre": "Maciel",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44263307",
    "email": "candelarodriguez.fl04@gmail.com",
    "apellido": "aylén candela",
    "nombre": "rodríguez florentin",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "34491310",
    "email": "nilito.10@outlook.com",
    "apellido": "Xavier",
    "nombre": "Contreras",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "45929242",
    "email": "noralijzr@gmail.com",
    "apellido": "Norali",
    "nombre": "Jimenez Condori",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43389124",
    "email": "danielasv2001@gmail.com",
    "apellido": "Daniela",
    "nombre": "Sanchez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "94690185",
    "email": "nnarey16@gmail.com",
    "apellido": "Narey Lourdes",
    "nombre": "Silveira Fernandez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "11987470",
    "email": "guillermolink2014@gmail.com",
    "apellido": "Guillermo",
    "nombre": "Link",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "34970959",
    "email": "okov90@gmail.com",
    "apellido": "Maria",
    "nombre": "Okovic",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "40306829",
    "email": "urielschmid1@gmail.com",
    "apellido": "uriel",
    "nombre": "schmid",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "48678223",
    "email": "jaz.malaponte08@gmail.com",
    "apellido": "Jazmín Aylen",
    "nombre": "Malaponte",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44351647",
    "email": "maxiriedel05@gmail.com",
    "apellido": "Maxi",
    "nombre": "Riedel",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47556471",
    "email": "moracristiani090@gmail.com",
    "apellido": "Mora Andrea",
    "nombre": "Cristiani",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47165360",
    "email": "annasofiaponce12@gmail.com",
    "apellido": "Lalo",
    "nombre": "Ponce",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "30386272",
    "email": "matinicolaci01@gmail.com",
    "apellido": "Matías",
    "nombre": "Nicolaci",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "39404105",
    "email": "casandracgerbiez@gmail.com",
    "apellido": "Casandra",
    "nombre": "Gerbiez",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 100
  },
  {
    "dni": "47066745",
    "email": "laragomez044@gmail.com",
    "apellido": "Lara",
    "nombre": "Gómez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45825619",
    "email": "anarg6008@gmail.com",
    "apellido": "Ana",
    "nombre": "Rios Gomez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "14990953",
    "email": "50.veronicagarcia@gmail.com",
    "apellido": "Verónica",
    "nombre": "García",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "46741546",
    "email": "agustinaaracelizuniga@gmail.com",
    "apellido": "Agustina Araceli",
    "nombre": "Zuñiga",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "95392543",
    "email": "diannymsb@gmail.com",
    "apellido": "Dianny Michele",
    "nombre": "Silva Bonilla",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44458315",
    "email": "giuli.dparrota@gmail.com",
    "apellido": "Giuliano",
    "nombre": "Parrota",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "29517598",
    "email": "estudiogallenti@gmail.com",
    "apellido": "Sebastián",
    "nombre": "Gallenti",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45689271",
    "email": "sofi.rd028@gmail.com",
    "apellido": "Sofia",
    "nombre": "Ruiz Diaz",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46187585",
    "email": "kdavyt@gmail.com",
    "apellido": "Keila Nahir",
    "nombre": "Davyt",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "38684303",
    "email": "biancacartolano@gmail.com",
    "apellido": "Bianca",
    "nombre": "Cartolano",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "42955468",
    "email": "leonelrussierfilosofia@gmail.com",
    "apellido": "Leonel Gabriel",
    "nombre": "Russier",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "21617265",
    "email": "roxana_docampo@yahoo.com.ar",
    "apellido": "Roxana",
    "nombre": "Do campo",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43871001",
    "email": "julibelen3011@gmail.com",
    "apellido": "Julieta",
    "nombre": "Toledo",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "45128514",
    "email": "melinatedesco009@gmail.com",
    "apellido": "Melina",
    "nombre": "Tedesco",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46877385",
    "email": "irurzunac@gmail.com",
    "apellido": "Agustina Celeste",
    "nombre": "Irurzun",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42025720",
    "email": "nataliaenedinasuarez@gmail.com",
    "apellido": "Natalia Enedina",
    "nombre": "Suárez Mangin",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "45820678",
    "email": "svalen999@gmail.com",
    "apellido": "Valentina Antonella",
    "nombre": "Suarez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "40260842",
    "email": "fernandezmariacarolina@gmail.com",
    "apellido": "María Carolina",
    "nombre": "Fernández",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47030634",
    "email": "julialazzarilan@gmail.com",
    "apellido": "Julia",
    "nombre": "Lazzari Lanusse",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "36729690",
    "email": "macarena.ariascastillo@gmail.com",
    "apellido": "Macarena",
    "nombre": "Arias Castillo",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "45778602",
    "email": "lilasara04@gmail.com",
    "apellido": "Lila Sara",
    "nombre": "Pederiva",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "9616143",
    "email": "alejandra.vida@outlook.com",
    "apellido": "Alejandra",
    "nombre": "Vidaurre",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43581103",
    "email": "marylensav@yahoo.com.ar",
    "apellido": "María Elena",
    "nombre": "Savchenko",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44542069",
    "email": "mariarosariokusevitzky@gmail.com",
    "apellido": "María del Rosario",
    "nombre": "Kusevitzky",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46123661",
    "email": "irinapanusopulos@gmail.com",
    "apellido": "Irina",
    "nombre": "Panusopulos",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45825511",
    "email": "resinosantiago@gmail.com",
    "apellido": "Damian",
    "nombre": "Resino",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42932827",
    "email": "sebastian.fihman@gmail.com",
    "apellido": "Sebastián",
    "nombre": "Fihman",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "96104557",
    "email": "rosiadriana09@gmail.com",
    "apellido": "Rosangel",
    "nombre": "Rojas",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "94430648",
    "email": "shirpante2003@gmail.com",
    "apellido": "Shirley Andrea",
    "nombre": "Pante Ramos",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "41065336",
    "email": "espindolafranknicolas@gmail.com",
    "apellido": "Franco Nicolás",
    "nombre": "Espíndola",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "41308726",
    "email": "maitrangoni13@gmail.com",
    "apellido": "Maira",
    "nombre": "Trangoni",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47367497",
    "email": "valeapiccoli@gmail.com",
    "apellido": "Valeria",
    "nombre": "Piccoli",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42201577",
    "email": "coronellucilaart@gmail.com",
    "apellido": "Lucila Celeste",
    "nombre": "Coronel",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45313741",
    "email": "ivanhabilis@gmail.com",
    "apellido": "Ivan Federico",
    "nombre": "Krolikowski",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45237464",
    "email": "coronelrocio660@gmail.com",
    "apellido": "Rocio",
    "nombre": "Coronel",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "95602312",
    "email": "carlacastelo716@gmail.com",
    "apellido": "Carla",
    "nombre": "Castelo",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "42296887",
    "email": "jennifercasas907@gmail.com",
    "apellido": "Jennifer",
    "nombre": "Casas",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "18135961",
    "email": "teriova@yahoo.com.ar",
    "apellido": "Enrique Eleuterio",
    "nombre": "Vega Amaya",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "42256646",
    "email": "matiascch99@gmail.com",
    "apellido": "Matías",
    "nombre": "Cruz",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42688924",
    "email": "francocardozo.uba@gmail.com",
    "apellido": "Franco",
    "nombre": "Cardozo",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43591086",
    "email": "brendadiazz1307@gmail.com",
    "apellido": "Brenda",
    "nombre": "Diaz",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "22133428",
    "email": "silca_71b@hotmail.com",
    "apellido": "Silvia Beatriz",
    "nombre": "Carrizo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "48588995",
    "email": "milagroscamposvaldez@gmail.com",
    "apellido": "Milagros Elisa",
    "nombre": "Campos Valdez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44170633",
    "email": "vivas.gabriel.n@gmail.com",
    "apellido": "Gabriel",
    "nombre": "Vivas",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45618760",
    "email": "sofiageraldinemartinez@gmail.com",
    "apellido": "Sofia Geraldine",
    "nombre": "Martínez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "40955431",
    "email": "kakaroto11@live.com.ar",
    "apellido": "Ivan",
    "nombre": "Passalia",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "46192187",
    "email": "lola.rodriguezmendez04@gmail.com",
    "apellido": "Lola Sofía",
    "nombre": "Rodríguez Méndez",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "44729079",
    "email": "marcoscopie@gmail.com",
    "apellido": "Marcos",
    "nombre": "Copie",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "44590977",
    "email": "mileboni123@gmail.com",
    "apellido": "Milena",
    "nombre": "Bonifacio",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46442545",
    "email": "martuotero@icloud.com",
    "apellido": "Martina",
    "nombre": "Otero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "40784993",
    "email": "melinariveroyasmim@gmail.com",
    "apellido": "Melina Yasmín",
    "nombre": "Rivero",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "39171935",
    "email": "ignaciobacigaluppe@gmail.com",
    "apellido": "Nacho",
    "nombre": "Bacigaluppe",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "33155353",
    "email": "niko_754@hotmail.com",
    "apellido": "Nicolás",
    "nombre": "Roa",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45011227",
    "email": "evisdrive@gmail.com",
    "apellido": "eva guadalupe",
    "nombre": "lucero",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "46196541",
    "email": "balbuenaburgosfabianaabril@gmail.com",
    "apellido": "Fabiana Abril",
    "nombre": "Balbuena Burgos",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "31358345",
    "email": "javierprofehistoria@gmail.com",
    "apellido": "Javier",
    "nombre": "Müller",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "33778777",
    "email": "angeles770313@gmail.com",
    "apellido": "Mariangeles",
    "nombre": "Conde",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "96223721",
    "email": "juanmiguelxang@gmail.com",
    "apellido": "Juan Miguel",
    "nombre": "Chang",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47255069",
    "email": "nadiayo1239@gmail.com",
    "apellido": "Nadia Ianina",
    "nombre": "Pagnola",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45677937",
    "email": "karensanchez1321@gmail.com",
    "apellido": "Karen",
    "nombre": "Sanchez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44714932",
    "email": "abril.nunezg@gmail.com",
    "apellido": "Abril",
    "nombre": "Nuñez Gerónimo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46584054",
    "email": "juanayriarte@gmail.com",
    "apellido": "Juana",
    "nombre": "Yriarte",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45239732",
    "email": "camilabelmes@gmail.com",
    "apellido": "Camila",
    "nombre": "Belmes",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46579571",
    "email": "matiasvazqueznolasco@gmail.com",
    "apellido": "Matías",
    "nombre": "Vázquez Nolasco",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "48465245",
    "email": "rodriguezroucojuana@gmail.com",
    "apellido": "Juana",
    "nombre": "Rodríguez Rouco",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44829840",
    "email": "soymalenamartinez@gmail.com",
    "apellido": "Malena",
    "nombre": "Martínez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "28936305",
    "email": "petrosdonn@gmail.com",
    "apellido": "Pedro",
    "nombre": "Donnerstag",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "46919379",
    "email": "felibeck2005@gmail.com",
    "apellido": "Felicitas",
    "nombre": "Beck",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "45821196",
    "email": "orianaasmatuni@gmail.com",
    "apellido": "Brisa Oriana Estefania",
    "nombre": "Asmat Portal",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "45582324",
    "email": "onuindiarojas@gmail.com",
    "apellido": "ONA ELENA",
    "nombre": "ROJAS",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44895222",
    "email": "noahesposito107@gmail.com",
    "apellido": "Noah",
    "nombre": "Esposito",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "38071663",
    "email": "micacostilla@gmail.com",
    "apellido": "Micaela",
    "nombre": "Costilla",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46878329",
    "email": "delazzarifelicitas@gmail.com",
    "apellido": "Felicitas",
    "nombre": "De Lazzari",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43875060",
    "email": "mateostefaror@gmail.com",
    "apellido": "Mateo",
    "nombre": "Stefanides Rohr",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "41332314",
    "email": "brenporcopio@gmail.com",
    "apellido": "Brenda",
    "nombre": "Porcopio",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44965050",
    "email": "pepefabrizio17@gmail.com",
    "apellido": "Fabrizio",
    "nombre": "Pepe",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47298084",
    "email": "abril.rubiomoran96@gmail.com",
    "apellido": "Abril Kiara",
    "nombre": "Rubio Moran",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43442426",
    "email": "santiagourielponcinimantegazza@gmail.com",
    "apellido": "Santiago Uriel",
    "nombre": "Poncini",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44793112",
    "email": "milagrosssjuarez02@gmail.com",
    "apellido": "Milagros",
    "nombre": "Juárez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43056022",
    "email": "ludmila_leguiza@yahoo.com.ar",
    "apellido": "Ludmila Belén",
    "nombre": "Leguiza Gutierre",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "36073223",
    "email": "antoogalli@gmail.com",
    "apellido": "Antonella Laura",
    "nombre": "Galli",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "14611430",
    "email": "lali.bauti@yahoo.com",
    "apellido": "Laura",
    "nombre": "Calcagno",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "45315472",
    "email": "rosariolujangalloso@gmail.com",
    "apellido": "Brisa Rosario Luján",
    "nombre": "Galloso",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42672321",
    "email": "lucas_ezequiel54@hotmail.com",
    "apellido": "Lucas",
    "nombre": "González",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "41880541",
    "email": "danaibarrola@gmail.com",
    "apellido": "Dana",
    "nombre": "Ibarrola",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43984166",
    "email": "sofiigreenday@gmail.com",
    "apellido": "sofia",
    "nombre": "pedraglio",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43445377",
    "email": "rubinomelissadaiana@gmail.com",
    "apellido": "Melissa Daiana",
    "nombre": "Rubino",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "42834453",
    "email": "micaelaheredia268@hotmail.com",
    "apellido": "Micaela Belén",
    "nombre": "Heredia",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "42647134",
    "email": "caggibruno1@gmail.com",
    "apellido": "bruno marcelo",
    "nombre": "caggi",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "36359405",
    "email": "victorialibros91@gmail.com",
    "apellido": "María Victoria",
    "nombre": "Aceval",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47147490",
    "email": "ferrarislucia27@gmail.com",
    "apellido": "Lucía",
    "nombre": "Ferraris",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42493925",
    "email": "alderetecami@gmail.com",
    "apellido": "Camila",
    "nombre": "Alderete",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "43895968",
    "email": "danielaheilmandhl@gmail.com",
    "apellido": "Daniela",
    "nombre": "Heilman",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46194990",
    "email": "ruizmilagros0902@gmail.com",
    "apellido": "Karen Milagros",
    "nombre": "Ruiz",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43869896",
    "email": "aldimr77@gmail.com",
    "apellido": "Aldana",
    "nombre": "Rodríguez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "45619335",
    "email": "ayalavalentinabril@gmail.com",
    "apellido": "Valentina Abril",
    "nombre": "Ayala",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46947543",
    "email": "sofiabobryk4@gmail.com",
    "apellido": "Sofía Milena",
    "nombre": "Bobryk",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "39460698",
    "email": "karenrynki@hotmail.com",
    "apellido": "Karen",
    "nombre": "Rynkiewicz",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46988389",
    "email": "melinafernandezliendo@gmail.com",
    "apellido": "Melina",
    "nombre": "Fernández Liendo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43574853",
    "email": "jazminjacint49@gmail.com",
    "apellido": "Jazmin",
    "nombre": "Jacinto",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47701495",
    "email": "victoriabarreto911@gmail.com",
    "apellido": "Victoria",
    "nombre": "Barreto Borlenghi",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "41469437",
    "email": "jenniferquintana45@gmail.com",
    "apellido": "Jennifer",
    "nombre": "Quintana",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43254406",
    "email": "ludmilarociocespedes@gmail.com",
    "apellido": "Ludmila",
    "nombre": "Cespedes",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47177069",
    "email": "malenamontesdeoca2006@gmail.com",
    "apellido": "Malena",
    "nombre": "Montes de Oca",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "25734212",
    "email": "emilez2001@gmail.com",
    "apellido": "Analia",
    "nombre": "Villegas",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "38806330",
    "email": "julietatm72@gmail.com",
    "apellido": "Julieta",
    "nombre": "Garcia",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46956550",
    "email": "verafc2005@gmail.com",
    "apellido": "Vera",
    "nombre": "Fernández",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44870226",
    "email": "cuencajuan37@gmail.com",
    "apellido": "Juan Francisco",
    "nombre": "Cuenca",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "23780086",
    "email": "marceladelma@hotmail.com",
    "apellido": "Marcela",
    "nombre": "GUTIÉRREZ",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "21787735",
    "email": "pandolfiflavia5@gmail.com",
    "apellido": "Flavia Estela",
    "nombre": "Pandolfi",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "45298017",
    "email": "candeqailen1@gmail.com",
    "apellido": "Candela",
    "nombre": "Quiñonez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46878385",
    "email": "lpessi83@gmail.com",
    "apellido": "Luciana",
    "nombre": "Pessi",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "33875044",
    "email": "victoria.ipas@gmail.com",
    "apellido": "victoria",
    "nombre": "Ipas Aguado",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "94727402",
    "email": "odette12delgado@gmail.com",
    "apellido": "Alisson",
    "nombre": "Ayala Delgado",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47030670",
    "email": "trinidadlbriceno@gmail.com",
    "apellido": "Trinidad",
    "nombre": "Briceño",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "13386022",
    "email": "monica.destefano20@gmail.com",
    "apellido": "Mónica",
    "nombre": "Destefano",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "42660069",
    "email": "milagroshass00@gmail.com",
    "apellido": "Milagros",
    "nombre": "Hass",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43820283",
    "email": "granceyazmin@gmail.com",
    "apellido": "Yasmin",
    "nombre": "Grance",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "96421382",
    "email": "toxote07@gmail.com",
    "apellido": "Cristian",
    "nombre": "Marin",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "45778729",
    "email": "rociomagalireyes@gmail.com",
    "apellido": "Rocio",
    "nombre": "Reyes",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43877078",
    "email": "danyrebucco13@gmail.com",
    "apellido": "Daniela",
    "nombre": "Rebucco",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "35138100",
    "email": "mlourdes.funes@gmail.com",
    "apellido": "María Lourdes",
    "nombre": "Funes",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43910607",
    "email": "damialcaraz10@gmail.com",
    "apellido": "Damian",
    "nombre": "Alcaraz",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45310815",
    "email": "sofiasardan81@gmail.com",
    "apellido": "Sofia Aylen",
    "nombre": "Sardan",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "96296819",
    "email": "tabans052@gmail.com",
    "apellido": "Tabatha Maria",
    "nombre": "Niebles Sanjuan",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45324239",
    "email": "garciacandymelanie@gmail.com",
    "apellido": "Candy",
    "nombre": "Garcia",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44259107",
    "email": "lucianaadrian2002@gmail.com",
    "apellido": "Luciana",
    "nombre": "Adrian",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46472948",
    "email": "veraalejandro131@gmail.com",
    "apellido": "Alejandro",
    "nombre": "Vera",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47550735",
    "email": "felicitasvillalba07@gmail.com",
    "apellido": "Felicitas",
    "nombre": "Villalba",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43043600",
    "email": "mayraolivera2000@gmail.com",
    "apellido": "Mayra",
    "nombre": "Olivera",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "33669475",
    "email": "laura.s.aguilar@gmail.com",
    "apellido": "Laura",
    "nombre": "Aguilar",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43573434",
    "email": "belubraile@gmail.com",
    "apellido": "Maria Belen",
    "nombre": "Braile",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "40730385",
    "email": "yayrivarola@gmail.com",
    "apellido": "Suyay",
    "nombre": "Rivarola",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45301561",
    "email": "maitej083@gmail.com",
    "apellido": "Maite",
    "nombre": "Juarez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47205213",
    "email": "constanzaevarodriguez@gmail.com",
    "apellido": "Constanza Eva",
    "nombre": "Rodríguez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46688191",
    "email": "rocarbogniani@gmail.com",
    "apellido": "Rocio pilar",
    "nombre": "Carbogniani",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44322307",
    "email": "santaigostabile@gmail.com",
    "apellido": "Santiago",
    "nombre": "Stabile",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "95319256",
    "email": "vanessacmartinezg@gmail.com",
    "apellido": "Vanessa",
    "nombre": "Martínez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44553450",
    "email": "brunosghelfo@gmail.com",
    "apellido": "Bruno Valentín",
    "nombre": "Sghelfi Arano",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "41690760",
    "email": "luanasanchez1998@gmail.com",
    "apellido": "Luana",
    "nombre": "Sanchez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47494672",
    "email": "benitezguadalupeantonella@gmail.com",
    "apellido": "Guadalupe",
    "nombre": "Benítez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47023420",
    "email": "mmattia2006@uba.ar",
    "apellido": "Manuel",
    "nombre": "Mattia",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "40392499",
    "email": "carla_abib@hotmail.com",
    "apellido": "Carla",
    "nombre": "Iannelli",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45303864",
    "email": "almarazrshaiel@gmail.com",
    "apellido": "Rocío Shaiel",
    "nombre": "Almaraz",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "39747973",
    "email": "rojasyesy@hotmail.com",
    "apellido": "Yesica",
    "nombre": "Rojas",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "47100528",
    "email": "lolafacultad8@gmail.com",
    "apellido": "Lola",
    "nombre": "Oviedo",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47494261",
    "email": "mateowille@gmail.com",
    "apellido": "Mateo",
    "nombre": "Wille",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43905164",
    "email": "iaia28mendez@gmail.com",
    "apellido": "Iara",
    "nombre": "Mendez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45823088",
    "email": "ciminochiara01@gmail.com",
    "apellido": "chiara",
    "nombre": "cimino",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43405354",
    "email": "micablopezc@gmail.com",
    "apellido": "Micaela Belén",
    "nombre": "López Carreira",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45322729",
    "email": "erickrojas2017@hotmail.com",
    "apellido": "Erick",
    "nombre": "Rojas",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "95519308",
    "email": "ximeferrera08@gmail.com",
    "apellido": "Ximena Nayara",
    "nombre": "Ferrera Silva",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46269653",
    "email": "catabellusci@gmail.com",
    "apellido": "Catalina",
    "nombre": "Bellusci",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44094374",
    "email": "cabralflorencia127@gmail.com",
    "apellido": "Florencia Martina",
    "nombre": "Cabral",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "38889514",
    "email": "alvarezceciliajacqueline@gmail.com",
    "apellido": "Cecilia Jacqueline",
    "nombre": "Alvarez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "40849797",
    "email": "sofiatocci97@gmail.com",
    "apellido": "Sofía Nilda",
    "nombre": "Tocci",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47680596",
    "email": "biancasoliglesias@gmail.com",
    "apellido": "Bianca",
    "nombre": "Iglesias",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42176784",
    "email": "milagrosmagaligonzalez9@gmail.com",
    "apellido": "Milagros Magali",
    "nombre": "Gonzalez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "37178411",
    "email": "ijoaquinmancini@gmail.com",
    "apellido": "Ignacio",
    "nombre": "Mancini",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46756419",
    "email": "maitenaperelli@gmail.com",
    "apellido": "Maitena",
    "nombre": "Perelli",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47863652",
    "email": "miabruck13@gmail.com",
    "apellido": "Mia",
    "nombre": "Brückler",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "33912762",
    "email": "navasleonardo88@gmail.com",
    "apellido": "Leonardo",
    "nombre": "Navas",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "43875080",
    "email": "camilagonzalezmoure@gmail.com",
    "apellido": "Camila",
    "nombre": "González Moure",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "30444825",
    "email": "jeremarjoya@gmail.com",
    "apellido": "Jeremias",
    "nombre": "Mariño",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "35434939",
    "email": "rochamdq15@gmail.com",
    "apellido": "Rocío Fernanda",
    "nombre": "Mercado",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "17499680",
    "email": "juliodavidrubinstein@gmail.com",
    "apellido": "David Rubinstein",
    "nombre": "Rubinstein",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "47974575",
    "email": "angidepilato@gmail.com",
    "apellido": "Angelina Paola",
    "nombre": "De Pilato Pineda",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "45239495",
    "email": "camilaaramirez26@gmail.com",
    "apellido": "camila",
    "nombre": "ramirez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46689950",
    "email": "helenarichi0@gmail.com",
    "apellido": "Helena",
    "nombre": "Richi Parera",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47168760",
    "email": "randivioleta@gmail.com",
    "apellido": "Violeta",
    "nombre": "Randi Szretter",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46290182",
    "email": "sofiliberczuk@gmail.com",
    "apellido": "Sofia",
    "nombre": "Liberczuk",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44621319",
    "email": "zamvillamayor@gmail.com",
    "apellido": "Zamira",
    "nombre": "Villamayor",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "20665108",
    "email": "silvina.ar@gmail.com",
    "apellido": "Silvina",
    "nombre": "Paladino",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47126034",
    "email": "abrilzarateramos@gmail.com",
    "apellido": "Abril",
    "nombre": "Zarate Ramos",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "22000184",
    "email": "vanesaeugenia4@gmail.com",
    "apellido": "Vanesa Eugenia",
    "nombre": "Piquer",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "35137623",
    "email": "paola15_05@yahoo.com.ar",
    "apellido": "Patricia Paola",
    "nombre": "Díaz",
    "carrera": "Geografía",
    "porcentaje_beca": 100
  },
  {
    "dni": "40767300",
    "email": "d.antonella10@gmail.com",
    "apellido": "Antonella Belén",
    "nombre": "Delgado",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "47687290",
    "email": "mafe.fernandezmontano@gmail.com",
    "apellido": "Maria Fernanda",
    "nombre": "Fernandez Montaño",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43180384",
    "email": "hidalgobelen21@gmail.com",
    "apellido": "Belen",
    "nombre": "Hidalgo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "24805193",
    "email": "co.antropo@gmail.com",
    "apellido": "Corina",
    "nombre": "Iglesias",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "38797198",
    "email": "nico.alvarez95@hotmail.com",
    "apellido": "Nicolas Martin",
    "nombre": "Alvarez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "40923014",
    "email": "cristaldalilacancinos@gmail.com",
    "apellido": "Dalila",
    "nombre": "Cancinos",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "40748516",
    "email": "camilalunaperezvilla2@hotmail.com",
    "apellido": "Camila",
    "nombre": "Perez Villa",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "47565326",
    "email": "yazmin.bere2006@gmail.com",
    "apellido": "Yazmin",
    "nombre": "Chazarreta",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45233075",
    "email": "romeodamico2003@gmail.com",
    "apellido": "Romeo",
    "nombre": "Damico",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "41890024",
    "email": "yariel451@gmail.com",
    "apellido": "Yamil Ariel",
    "nombre": "Baraj",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "43396255",
    "email": "rociomaribel2010@gmail.com",
    "apellido": "Rocio Maribel",
    "nombre": "Orellano",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "95521649",
    "email": "dubiousdaylam@gmail.com",
    "apellido": "Daylam",
    "nombre": "Fernández de Castro",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "24804019",
    "email": "dario_vm@hotmail.com",
    "apellido": "dario",
    "nombre": "Martinez",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "96272620",
    "email": "beatrizdelanube7@gmail.com",
    "apellido": "Verónica",
    "nombre": "Ordóñez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "29248987",
    "email": "poetryar@yahoo.com.ar",
    "apellido": "Bruno Ismael",
    "nombre": "Heymann Raggio",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45237455",
    "email": "franschachtel@gmail.com",
    "apellido": "Francisca",
    "nombre": "Schachtel Servera",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "41800096",
    "email": "fenixescarlata99@gmail.com",
    "apellido": "Felix Leo",
    "nombre": "De Salvo",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "48551036",
    "email": "alhuerivero.edu@gmail.com",
    "apellido": "Alhue Clara",
    "nombre": "Rivero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "17392878",
    "email": "dantelias@yahoo.com.ar",
    "apellido": "Dante Alberto José",
    "nombre": "Contreras",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "32792839",
    "email": "mariasoledadramos_@hotmail.com",
    "apellido": "María Soledad",
    "nombre": "Ramos",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46030195",
    "email": "milagroswais@gmail.com",
    "apellido": "Milagros Nicole",
    "nombre": "Waisman",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47132461",
    "email": "violeta.ale.2006@gmail.com",
    "apellido": "Violeta",
    "nombre": "Alé",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47834554",
    "email": "laralemoss14@gmail.com",
    "apellido": "Lara",
    "nombre": "Lemos",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41921326",
    "email": "rociocamilaromero9@gmail.com",
    "apellido": "Rocío",
    "nombre": "Romero",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "47098380",
    "email": "antocominelli72@gmail.com",
    "apellido": "Antonella Agustina",
    "nombre": "Cominelli",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47255216",
    "email": "tabatha_tatiana@hotmail.com",
    "apellido": "tabatha",
    "nombre": "lopez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43086099",
    "email": "florescandela2001@gmail.com",
    "apellido": "Candela",
    "nombre": "Flores",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45630973",
    "email": "rociocanuti@gmail.com",
    "apellido": "Rocio",
    "nombre": "Canuti",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41622676",
    "email": "daniavalosdr@gmail.com",
    "apellido": "Daniela Evelyn",
    "nombre": "Ávalos Juárez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47275043",
    "email": "henricotgiuliana@gmail.com",
    "apellido": "Giuliana",
    "nombre": "Henricot",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43896923",
    "email": "agustinserantes18@gmail.com",
    "apellido": "Agustin",
    "nombre": "Serantes",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "40748187",
    "email": "delfiocatalano@gmail.com",
    "apellido": "Delfina",
    "nombre": "Catalano",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "12085959",
    "email": "ojhurtado@gmail.com",
    "apellido": "Omar Jesus",
    "nombre": "Hurtado",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46645081",
    "email": "sofiainesmovia@gmail.com",
    "apellido": "Sofía Ines",
    "nombre": "Movia Gaetmank",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47043640",
    "email": "guillemillan.calero@gmail.com",
    "apellido": "Guillermina",
    "nombre": "Millan calero",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "48046051",
    "email": "barolimalena@gmail.com",
    "apellido": "Malena",
    "nombre": "Baroli",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "41164430",
    "email": "mluzcapdevila@gmail.com",
    "apellido": "María Luz",
    "nombre": "Capdevila",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "45226018",
    "email": "fiorellamarino0@gmail.com",
    "apellido": "Fiorella",
    "nombre": "Marino Del Raso",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "33118332",
    "email": "loanagerez10@gmail.com",
    "apellido": "Jesica Loana",
    "nombre": "Gerez",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "47010467",
    "email": "vickyabril1313@gmail.com",
    "apellido": "Victoria",
    "nombre": "Arpires",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44337822",
    "email": "montolioivanna@gmail.com",
    "apellido": "Ivanna",
    "nombre": "Montolio",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "42055021",
    "email": "francocordoba9917@gmail.com",
    "apellido": "Franco",
    "nombre": "Córdoba",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46200317",
    "email": "morenaluna2004@gmail.com",
    "apellido": "Morena",
    "nombre": "Luna",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43571413",
    "email": "uliseslimaibanez@gmail.com",
    "apellido": "Ulises",
    "nombre": "Lima Ibañez",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "39267572",
    "email": "guadalupelebrero1@gmail.com",
    "apellido": "Guadalupe",
    "nombre": "Lebrero Rial",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "23130858",
    "email": "colman242@gmail.com",
    "apellido": "Pablo",
    "nombre": "Colman",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "39427010",
    "email": "roooescudero@gmail.com",
    "apellido": "Rocio Daniela",
    "nombre": "Escudero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45344999",
    "email": "juafederico1@gmail.com",
    "apellido": "Juana",
    "nombre": "Federico",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "39371655",
    "email": "sofiacaballero_95@hotmail.com",
    "apellido": "Sofia",
    "nombre": "Caballero",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "47285385",
    "email": "anna.platino186@gmail.com",
    "apellido": "Anna Sofía",
    "nombre": "Platino",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "23780722",
    "email": "guillermo893@yahoo.com.ar",
    "apellido": "Guillermo",
    "nombre": "Rios",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "95440474",
    "email": "josue.bedoya.lozada@gmail.com",
    "apellido": "Josue",
    "nombre": "Bedoya",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "32144745",
    "email": "makotokino18@hotmail.com",
    "apellido": "Maria",
    "nombre": "Cueto Crespo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42622316",
    "email": "wandavgarcia15@gmail.com",
    "apellido": "Wanda",
    "nombre": "García",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45823660",
    "email": "4milagrosfernandez@gmail.com",
    "apellido": "Milagros",
    "nombre": "Fernandez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "27218372",
    "email": "seleon8901@hotmail.com",
    "apellido": "Sebastián",
    "nombre": "León",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "45007273",
    "email": "agusrios206@gmail.com",
    "apellido": "Agustina",
    "nombre": "Rios",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42433340",
    "email": "julietamastronardo@gmail.com",
    "apellido": "Julieta",
    "nombre": "Mastronardo",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43814662",
    "email": "nat.red471@gmail.com",
    "apellido": "Natalia",
    "nombre": "Rojas García",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "42471436",
    "email": "langerbetsabe@outlook.com",
    "apellido": "Nazarena Betsabé",
    "nombre": "Langer",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "96306019",
    "email": "melinavtvs@gmail.com",
    "apellido": "Melina",
    "nombre": "Trujillo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44686151",
    "email": "gomezgerezmilagros@gmail.com",
    "apellido": "Milagros",
    "nombre": "Gomez Gerez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47065767",
    "email": "val77olivera@gmail.com",
    "apellido": "valentina",
    "nombre": "olivera",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44783960",
    "email": "ruizbraian476@gmail.com",
    "apellido": "Ivan braian",
    "nombre": "Ruiz",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43323101",
    "email": "camila.lopez.1905@gmail.com",
    "apellido": "Camila",
    "nombre": "López",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "35048925",
    "email": "becca.chavez15@gmail.com",
    "apellido": "Rebeca",
    "nombre": "Chavez",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "47029248",
    "email": "abruasch@gmail.com",
    "apellido": "Abril",
    "nombre": "Asch",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45239854",
    "email": "leivalucianaaylen@gmail.com",
    "apellido": "Luciana Aylen",
    "nombre": "Leiva",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "39771297",
    "email": "ntgoldman@gmail.com",
    "apellido": "Noelia",
    "nombre": "Taborda Goldman",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 100
  },
  {
    "dni": "35902799",
    "email": "lnelcastillo@gmail.com",
    "apellido": "Leonel",
    "nombre": "Castillo",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "42226109",
    "email": "guirdigarcia@gmail.com",
    "apellido": "Santiago",
    "nombre": "García",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "44669225",
    "email": "camiquinteroratto@gmail.com",
    "apellido": "Camila",
    "nombre": "Quintero Ratto",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47377917",
    "email": "jonathanmacieltoledo@gmail.com",
    "apellido": "Jonathan",
    "nombre": "Maciel Toledo",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47384926",
    "email": "bordagarayloli@gmail.com",
    "apellido": "Lola",
    "nombre": "Bordagaray",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "13655287",
    "email": "patricianoragaribaldi@gmail.com",
    "apellido": "Patricia Nora",
    "nombre": "Garibaldi",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47167191",
    "email": "francanoceti@gmail.com",
    "apellido": "Franca",
    "nombre": "Noceti Simonassi",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "44507439",
    "email": "duamandrade@gmail.com",
    "apellido": "Duam",
    "nombre": "Andrade",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "40303576",
    "email": "narenazara@gmail.com",
    "apellido": "Narella",
    "nombre": "Názara",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43-031-225",
    "email": "joseinsl2018@gmail.com",
    "apellido": "Jose Ignacio",
    "nombre": "Pie",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "94414006",
    "email": "daniigomes@gmail.com",
    "apellido": "Daniela",
    "nombre": "Barbosa Gomes",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45077555",
    "email": "camilaescudero908@gmail.com",
    "apellido": "Camila Luciana",
    "nombre": "Escudero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46696129",
    "email": "costavictoria05@gmail.com",
    "apellido": "Victoria",
    "nombre": "Costa",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "35254831",
    "email": "annelizabethsayos@gmail.com",
    "apellido": "Ana Elizabeth",
    "nombre": "Sayos",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "46208603",
    "email": "biaggiabril@gmail.com",
    "apellido": "Abril",
    "nombre": "Biaggi",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43728529",
    "email": "florbenitezz09@gmail.com",
    "apellido": "Florencia",
    "nombre": "Benitez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45807664",
    "email": "ariadnacataldi@gmail.com",
    "apellido": "Ariadna",
    "nombre": "Cataldi",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "40188466",
    "email": "camilapeloso.97@gmail.com",
    "apellido": "Camila",
    "nombre": "Peloso",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43404026",
    "email": "laura.rube2001@gmail.com",
    "apellido": "Ana Laura",
    "nombre": "Rubé",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46993237",
    "email": "byronestebanum@gmail.com",
    "apellido": "Byron Esteban",
    "nombre": "Urriza Morán",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43860837",
    "email": "magui.000a@gmail.com",
    "apellido": "Margarita",
    "nombre": "Gimenez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "48510044",
    "email": "nicolaigim3nez@gmail.com",
    "apellido": "Nicolas",
    "nombre": "Gimenez Urbina",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43385055",
    "email": "laravictoriaespinoza@gmail.com",
    "apellido": "Lara",
    "nombre": "Espinoza",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "34748094",
    "email": "fernanda-paredes28@hotmail.com",
    "apellido": "María Fernanda",
    "nombre": "Paredes",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "45622769",
    "email": "delgadopaloma304@gmail.com",
    "apellido": "Paloma",
    "nombre": "Delgado",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44552556",
    "email": "camilauzet13@hotmail.com",
    "apellido": "Camila",
    "nombre": "Lauzet",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "95973240",
    "email": "natuchistyles@gmail.com",
    "apellido": "Natalia",
    "nombre": "Albinagorta",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44512200",
    "email": "mariacandelamackay@uba.ar",
    "apellido": "Maria Candela",
    "nombre": "Mac'Kay",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45749575",
    "email": "lucasvolador@gmail.com",
    "apellido": "Lucas",
    "nombre": "Golombek",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "40857214",
    "email": "ezequieldiazpereira@gmail.com",
    "apellido": "Ezequiel Demian",
    "nombre": "Diaz Pereira",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46941895",
    "email": "alerosas010@gmail.com",
    "apellido": "Alejandro Germán",
    "nombre": "Rosas",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "48032691",
    "email": "solramirez16007@gmail.com",
    "apellido": "Sol",
    "nombre": "Ramirez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47167205",
    "email": "agustalla24@gmail.com",
    "apellido": "Agustín",
    "nombre": "Tallarico",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43030555",
    "email": "martinadavalli1917@gmail.com",
    "apellido": "Martina",
    "nombre": "Davalli",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47220004",
    "email": "nailahgarcia99@gmail.com",
    "apellido": "Nailah",
    "nombre": "Garcia",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "40129328",
    "email": "abrillober97@gmail.com",
    "apellido": "Abril",
    "nombre": "Löber",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "37595432",
    "email": "virginiatognola@gmail.com",
    "apellido": "Virginia",
    "nombre": "Tognola",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43868386",
    "email": "ivanmedinakilling@gmail.com",
    "apellido": "Ivan",
    "nombre": "Medina Killing",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "42101737",
    "email": "demarziaylen@gmail.com",
    "apellido": "Aylén",
    "nombre": "De Marzi",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "54994736",
    "email": "blanca.lilith2@gmail.com",
    "apellido": "Blanca Lilith",
    "nombre": "Pontalti",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42723266",
    "email": "lautyvisciglio@gmail.com",
    "apellido": "LAUTARO",
    "nombre": "VISCIGLIO",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46703882",
    "email": "ludmilataborda12@gmail.com",
    "apellido": "Ludmila",
    "nombre": "Taborda",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46112749",
    "email": "paezpennacatherina@gmail.com",
    "apellido": "Catherina",
    "nombre": "Paez Penna",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47126337",
    "email": "ritaa.jabaz@gmail.com",
    "apellido": "Rita",
    "nombre": "Jabaz",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47030375",
    "email": "sof.orofino@gmail.com",
    "apellido": "Sofía Abril",
    "nombre": "Orofino",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45994310",
    "email": "florenciaimpini8@gmail.com",
    "apellido": "Florencia",
    "nombre": "Impini",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "31251201",
    "email": "ezequielbustelos@gmail.com",
    "apellido": "Ezequiel Dario",
    "nombre": "BUSTELO",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46442894",
    "email": "jalmada2701@gmail.com",
    "apellido": "Julian",
    "nombre": "Almada",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43092043",
    "email": "sogonzalez900@gmail.com",
    "apellido": "Sofía",
    "nombre": "González",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45819078",
    "email": "lourpedroso.04@gmail.com",
    "apellido": "Lourdes",
    "nombre": "Pedroso",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45945889",
    "email": "pilarfernandez1803@gmail.com",
    "apellido": "Pilar",
    "nombre": "Fernández",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45012738",
    "email": "melinaylengarcia@gmail.com",
    "apellido": "Melina",
    "nombre": "García",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42631772",
    "email": "joaquinasilio@gmail.com",
    "apellido": "Joaquina",
    "nombre": "Silio",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46992082",
    "email": "robledomaia0@gmail.com",
    "apellido": "Maia",
    "nombre": "Robledo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "46437637",
    "email": "franoutedao3@gmail.com",
    "apellido": "Francisco",
    "nombre": "Outeda",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42321944",
    "email": "florencialourdesf01@gmail.com",
    "apellido": "Florencia",
    "nombre": "Montenegro",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46872567",
    "email": "juanalderete4273@gmail.com",
    "apellido": "Juan",
    "nombre": "Alderete",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45928093",
    "email": "priscilamayte327@gmail.com",
    "apellido": "Priscila Mayte",
    "nombre": "Gil",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44006709",
    "email": "alegui144@gmail.com",
    "apellido": "Agustina",
    "nombre": "Leguizamón",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42776107",
    "email": "luphe.flores248@gmail.com",
    "apellido": "Guadalupe Lucía",
    "nombre": "Flores",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "44594038",
    "email": "franciscotrujillo2002@gmail.com",
    "apellido": "Francisco",
    "nombre": "Trujillo",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43591976",
    "email": "fariasjuanmartin3@gmail.com",
    "apellido": "Juan Martín",
    "nombre": "Farías",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47381726",
    "email": "tatimigliorisi@gmail.com",
    "apellido": "Agostina T",
    "nombre": "Migliorisi",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43100245",
    "email": "agustinamedina2015@gmail.com",
    "apellido": "Agustina",
    "nombre": "Medina",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46579649",
    "email": "luciabmarbian@gmail.com",
    "apellido": "Lucía Belén",
    "nombre": "Marbián",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45310094",
    "email": "martinaparedes.le@gmail.com",
    "apellido": "Martina",
    "nombre": "Paredes",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "41919662",
    "email": "massara.da99@gmail.com",
    "apellido": "Agustín",
    "nombre": "Massara",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42962539",
    "email": "dallealma@gmail.com",
    "apellido": "Alma",
    "nombre": "Dalle Carbonara",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "25115482",
    "email": "sebastiangoretta@gmail.com",
    "apellido": "sebastián",
    "nombre": "goretta",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "16557453",
    "email": "danielfranciscoacuna5@gmail.com",
    "apellido": "Daniel",
    "nombre": "acuña",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "30141389",
    "email": "natphilo07@hotmail.com",
    "apellido": "Natalia",
    "nombre": "Aspuru",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "4711342",
    "email": "solangemontenegro85@gmail.com",
    "apellido": "Solange",
    "nombre": "Montenegro",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "31782891",
    "email": "eternauta1985@gmail.com",
    "apellido": "Gustavo Ariel",
    "nombre": "Santamarina",
    "carrera": "Geografía",
    "porcentaje_beca": 100
  },
  {
    "dni": "32383570",
    "email": "julietacapristo@gmail.com",
    "apellido": "Julieta María",
    "nombre": "Capristo",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "45927069",
    "email": "knd.rojas1986@gmail.com",
    "apellido": "Candela",
    "nombre": "Rojas",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46357861",
    "email": "candeaf05@gmail.com",
    "apellido": "Candela Rocio Esmeralda",
    "nombre": "Acuña Flores",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "35989976",
    "email": "aguslecot@gmail.com",
    "apellido": "María Agustina",
    "nombre": "Lecot",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "43098139",
    "email": "alan.21.ema@gmail.com",
    "apellido": "Alan",
    "nombre": "Aguirre",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "42564922",
    "email": "aldanabadaracco@gmail.com",
    "apellido": "Aldana Soledad",
    "nombre": "Badaracco",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41707751",
    "email": "adrian.goez98@gmail.com",
    "apellido": "Angel adrian",
    "nombre": "Gonzalez",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "44609316",
    "email": "nahuelcavelli25@gmail.com",
    "apellido": "Cristian Nahuel",
    "nombre": "Cavelli",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47127452",
    "email": "federicoyankelevich06@gmail.com",
    "apellido": "Federico",
    "nombre": "Yankelevich",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "40900979",
    "email": "rizo.selee98@gmail.com",
    "apellido": "Selene",
    "nombre": "Rizo",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "35994604",
    "email": "agustin.pprieto@gmail.com",
    "apellido": "Agustín",
    "nombre": "Prieto",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "36070464",
    "email": "tocciflorencia91@gmail.com",
    "apellido": "Florencia",
    "nombre": "Tocci",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "45131325",
    "email": "agostinagmoreno@gmail.com",
    "apellido": "Agostina Graciela",
    "nombre": "Moreno",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44042395",
    "email": "mateobelossi1402@gmail.com",
    "apellido": "Mateo",
    "nombre": "Belossi",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45747945",
    "email": "francisco.bartenc@gmail.com",
    "apellido": "Francisco José",
    "nombre": "Bartenc",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47435826",
    "email": "slauti358@gmail.com",
    "apellido": "Lautaro",
    "nombre": "Stok",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "95554881",
    "email": "nathalibeltran24@gmail.com",
    "apellido": "Laura Nathali",
    "nombre": "González Beltrán",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "39207377",
    "email": "lara.waisman@gmail.com",
    "apellido": "Lara",
    "nombre": "Waisman",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47850554",
    "email": "saadeolivia@gmail.com",
    "apellido": "Olivia",
    "nombre": "Soria",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "44240389",
    "email": "candelaramoa@outlook.com",
    "apellido": "Candela Esmeralda",
    "nombre": "Ramoa",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43920218",
    "email": "guillerminabroens@gmail.com",
    "apellido": "Guillermina",
    "nombre": "Broens",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42901867",
    "email": "camila28prado@gmail.com",
    "apellido": "Camila",
    "nombre": "Prado",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "46912595",
    "email": "maryjoe.1709@gmail.com",
    "apellido": "María José",
    "nombre": "Villamil Alarcón",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "14118996",
    "email": "scampinijulio@gmail.com",
    "apellido": "Julio César",
    "nombre": "Faraglia Scampini",
    "carrera": "Geografía",
    "porcentaje_beca": 100
  },
  {
    "dni": "43036573",
    "email": "florenciasoldc@gmail.com",
    "apellido": "Florencia Sol",
    "nombre": "De Cesare",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "13652915",
    "email": "clementecolloca65@gmail.com",
    "apellido": "Clemente Eduardo",
    "nombre": "colloca",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "43871686",
    "email": "neribagley@gmail.com",
    "apellido": "Nerina Juliana",
    "nombre": "Bagnato Farley",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45681028",
    "email": "vazquezvictoriabelen@gmail.com",
    "apellido": "Victoria",
    "nombre": "Vazquez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "37948559",
    "email": "yani23f@gmail.com",
    "apellido": "Yanina",
    "nombre": "Filardi",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "38702189",
    "email": "yanina.mercurio@gmail.com",
    "apellido": "Yanina",
    "nombre": "Mercurio",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "43087259",
    "email": "ncarranza2k18@gmail.com",
    "apellido": "Nahuel",
    "nombre": "Carranza",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47167378",
    "email": "sashapetrenkoshapoval@gmail.com",
    "apellido": "Sasha",
    "nombre": "Petrenko Shapoval",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43570711",
    "email": "sebasafar@gmail.com",
    "apellido": "Malena",
    "nombre": "Safar",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "41395412",
    "email": "roman.guiyut@gmail.com",
    "apellido": "Roman",
    "nombre": "Guiyut",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47961653",
    "email": "adapuntes@gmail.com",
    "apellido": "Ada",
    "nombre": "Oliva Schejter",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46195226",
    "email": "tizianacalabrese.u@gmail.com",
    "apellido": "tiziana",
    "nombre": "calabrese",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "43441219",
    "email": "natashaileanajorge@gmail.com",
    "apellido": "Natasha Ileana",
    "nombre": "Niebuhr Jorge",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43100174",
    "email": "celinacabrera1106@gmail.com",
    "apellido": "Celina",
    "nombre": "Cabrera",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42591463",
    "email": "giulietta.anael@gmail.com",
    "apellido": "Giulietta",
    "nombre": "Roncali",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46092551",
    "email": "chiarellornella@gmail.com",
    "apellido": "Ornella Abril",
    "nombre": "Chiarello",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "21466449",
    "email": "belapope49@gmail.com",
    "apellido": "Gabriela Veronica",
    "nombre": "Bazan",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "45912253",
    "email": "fiorestroia@gmail.com",
    "apellido": "Fiorella",
    "nombre": "Stroia",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43720627",
    "email": "castillomilagros2284@gmail.com",
    "apellido": "Milagros",
    "nombre": "Castillo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "27745279",
    "email": "tixaprima@yahoo.com.br",
    "apellido": "Silvana",
    "nombre": "Cámera",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "44824931",
    "email": "noelujilove@gmail.com",
    "apellido": "Noelia",
    "nombre": "Romero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41179539",
    "email": "cintia.2010.aot@gmail.com",
    "apellido": "Cintia Elizabeth",
    "nombre": "Acosta Sandoval",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45074421",
    "email": "aulicinomariavictoria@gmail.com",
    "apellido": "María Victoria",
    "nombre": "Aulicino",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "42395072",
    "email": "m.milagros.caratti@gmail.com",
    "apellido": "Maria Milagros",
    "nombre": "Caratti",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "44361910",
    "email": "candestyle2@gmail.com",
    "apellido": "Candelaria Milagros",
    "nombre": "Flores",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44884815",
    "email": "agustingodoyaranda@gmail.com",
    "apellido": "Agustin",
    "nombre": "godoy",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "45203893",
    "email": "violetaichkha@gmail.com",
    "apellido": "Violeta",
    "nombre": "Ichkhanian",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "25789190",
    "email": "silvanamaida1@gmail.com",
    "apellido": "Silvana Claudia",
    "nombre": "Maida",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45315856",
    "email": "mika.perez023@gmail.com",
    "apellido": "Ruth Micaela",
    "nombre": "Perez",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47200865",
    "email": "28.lafountain@gmail.com",
    "apellido": "Emma",
    "nombre": "Lafuente",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46960565",
    "email": "martinafiedotin@gmail.com",
    "apellido": "Martina",
    "nombre": "Fiedotin",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43198069",
    "email": "araceliisiritto@gmail.com",
    "apellido": "Araceli",
    "nombre": "Iglesias Siritto",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "46701747",
    "email": "maiunzue1803@gmail.com",
    "apellido": "Maite",
    "nombre": "Unzué Rome",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "31176334",
    "email": "ferreyra_724@hotmail.com",
    "apellido": "Andrea",
    "nombre": "Ferreyra",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "28167083",
    "email": "alecd11@hotmail.com",
    "apellido": "Alejandro",
    "nombre": "Donnici",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "35336994",
    "email": "luciaguerrero1890@gmail.com",
    "apellido": "Lucía",
    "nombre": "Guerrero",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45291107",
    "email": "facundo.javier.carrasco@gmail.com",
    "apellido": "Facundo",
    "nombre": "Carrasco",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45075434",
    "email": "dantepedulla@gmail.com",
    "apellido": "Dante",
    "nombre": "Pedulla",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "36947331",
    "email": "candelallona@gmail.com",
    "apellido": "Candela",
    "nombre": "Llona",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "20640283",
    "email": "andreaedicion2025@gmail.com",
    "apellido": "Rita",
    "nombre": "Espindola",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "37124197",
    "email": "libertad.aver@gmail.com",
    "apellido": "Libertad",
    "nombre": "Averbuj",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "17730062",
    "email": "susanafuertemail@gmail.com",
    "apellido": "susana",
    "nombre": "fuerte",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "38241923",
    "email": "nanu.msz@live.com",
    "apellido": "Nadia",
    "nombre": "Martinez Szego",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43172135",
    "email": "mirimu@hotmail.com.ar",
    "apellido": "Miranda",
    "nombre": "Murray",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44655780",
    "email": "carcabaldelarosam@gmail.com",
    "apellido": "Malena",
    "nombre": "Carcabal de la Rosa",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44770265",
    "email": "ninacerrato@gmail.com",
    "apellido": "nina",
    "nombre": "cerrato",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44745000",
    "email": "carbianca140@gmail.com",
    "apellido": "Bianca Marina",
    "nombre": "Cardozo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42777774",
    "email": "macarenanoemigonzalez29072000@outlook.com",
    "apellido": "Macarena Noemí",
    "nombre": "González",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47434739",
    "email": "milenarearte16@gmail.com",
    "apellido": "Milena Jazmin",
    "nombre": "Rearte",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "39405849",
    "email": "lidiabfrutos@gmail.com",
    "apellido": "Lidia",
    "nombre": "Frutos",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46212878",
    "email": "abrilcamelie@gmail.com",
    "apellido": "Abril",
    "nombre": "Cruz",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47961064",
    "email": "barbarairenediazga@gmail.com",
    "apellido": "Bárbara",
    "nombre": "Díaz Banfi",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47295262",
    "email": "eva.stratta@gmail.com",
    "apellido": "Eva",
    "nombre": "Stratta",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "21100258",
    "email": "marchetticesar@gmail.com",
    "apellido": "César",
    "nombre": "Marchetti",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "47490163",
    "email": "rocioblanco121006@gmail.com",
    "apellido": "Rocio",
    "nombre": "Blanco",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "10801054",
    "email": "arielvictorfernandez@gmail.com",
    "apellido": "ariel victor",
    "nombre": "fernandez",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "44598196",
    "email": "xiarbovary@gmail.com",
    "apellido": "Benjamín",
    "nombre": "Alarcón",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "44821254",
    "email": "alfoalmir@gmail.com",
    "apellido": "Alfonsina",
    "nombre": "Almiron",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46027788",
    "email": "maiasosag@gmail.com",
    "apellido": "Maia M.",
    "nombre": "Sosa González",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "95662376",
    "email": "morelizh@gmail.com",
    "apellido": "Moreliz Naboriz",
    "nombre": "Hurtado Diaz",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "45688811",
    "email": "candedalpra@gmail.com",
    "apellido": "Candela",
    "nombre": "Dalprá Zampedri",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47296741",
    "email": "valenchubporcellana@gmail.com",
    "apellido": "Valentina Belen",
    "nombre": "Porcellana",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43805075",
    "email": "camilaivon944@gmail.com",
    "apellido": "Camila",
    "nombre": "López",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44501658",
    "email": "darioliendro434@gmail.com",
    "apellido": "William",
    "nombre": "Liendro",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "42591973",
    "email": "jara.ariana.a@gmail.com",
    "apellido": "Ariana",
    "nombre": "Jara",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44301740",
    "email": "nico.juares11@gmail.com",
    "apellido": "Nicolás Daniel",
    "nombre": "Juares",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "35325771",
    "email": "lu.lucianaromano@gmail.com",
    "apellido": "Luciana",
    "nombre": "Romano",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "44160088",
    "email": "ferreyragreta@gmail.com",
    "apellido": "Greta",
    "nombre": "Ferreyra",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "46950972",
    "email": "tiaraluz5@gmail.com",
    "apellido": "tiara luz",
    "nombre": "de martino",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46352132",
    "email": "guadalupemoreira782@gmail.com",
    "apellido": "Guadalupe soledad",
    "nombre": "moreira",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "42351431",
    "email": "painevilo79@gmail.com",
    "apellido": "Patricio Joaquín",
    "nombre": "Painevilo Duarte",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "96437511",
    "email": "antoniaa.rojel@gmail.com",
    "apellido": "Antonia",
    "nombre": "Azócar",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44764106",
    "email": "ailengnzlz12@gmail.com",
    "apellido": "Ailen",
    "nombre": "Gonzalez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "38947265",
    "email": "wendyserran96@gmail.com",
    "apellido": "Wendy Michelle",
    "nombre": "Serrán",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "39715873",
    "email": "yaccuzzinane@gmail.com",
    "apellido": "Nane",
    "nombre": "Yaccuzzi",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "35863343",
    "email": "roquerisoli1991@hotmail.com",
    "apellido": "Roque",
    "nombre": "Risoli",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "32958114",
    "email": "marianagabrielarios.ok@gmail.com",
    "apellido": "Mariana Gabriela",
    "nombre": "Rios",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "40955089",
    "email": "mvbaschiera@hotmail.com",
    "apellido": "Maria Victoria",
    "nombre": "Baschiera",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42029001",
    "email": "guadalupevazquezb@outlook.com",
    "apellido": "Guadalupe",
    "nombre": "Vazquez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "40240068",
    "email": "ailencaffieri@gmail.com",
    "apellido": "Ailen",
    "nombre": "Caffieri",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "46346938",
    "email": "martinaturquia2005@gmail.com",
    "apellido": "Martina",
    "nombre": "Turquía",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "30646172",
    "email": "paomesa2311@gmail.com",
    "apellido": "Erica",
    "nombre": "Mesa",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "44871019",
    "email": "matiasdocelois@gmail.com",
    "apellido": "Matias",
    "nombre": "Doce",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43978246",
    "email": "yessrb93@gmail.com",
    "apellido": "Yesica",
    "nombre": "Romero",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43869803",
    "email": "martuma1@hotmail.com",
    "apellido": "Martina Alexia",
    "nombre": "Maier",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41470702",
    "email": "lourdeslisetter@gmail.com",
    "apellido": "Lourdes Lisette",
    "nombre": "Reale",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "45284978",
    "email": "leandro19acosta@gmail.com",
    "apellido": "Leandro Daniel",
    "nombre": "Acosta",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46029763",
    "email": "violetaberon04@gmail.com",
    "apellido": "Violeta",
    "nombre": "Beron",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "47121945",
    "email": "jennifercaballerobritez@gmail.com",
    "apellido": "Jennifer",
    "nombre": "Caballero Britez",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "44482031",
    "email": "hequeralucila@gmail.com",
    "apellido": "Lucila Luna",
    "nombre": "Hequera",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "42965778",
    "email": "cattoni.pereyra@gmail.com",
    "apellido": "Victoria de los Milagros",
    "nombre": "Cattoni Pereyra",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "38934821",
    "email": "francofelic3@gmail.com",
    "apellido": "Franco",
    "nombre": "Felice",
    "carrera": "Letras",
    "porcentaje_beca": 100
  },
  {
    "dni": "44260077",
    "email": "leilabano14@gmail.com",
    "apellido": "Leila Agustina",
    "nombre": "Baño",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "33252479",
    "email": "danielageouba@gmail.com",
    "apellido": "Daniela",
    "nombre": "Rodríguez",
    "carrera": "Geografía",
    "porcentaje_beca": 100
  },
  {
    "dni": "43241759",
    "email": "candelasegura14@hotmail.com",
    "apellido": "Candela",
    "nombre": "Segura",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "29659802",
    "email": "loreninlpb@hotmail.com",
    "apellido": "Lorena",
    "nombre": "Barboza",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "35267321",
    "email": "ayelen.burgstaller@gmail.com",
    "apellido": "Ayelen",
    "nombre": "Burgstaller",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "44895964",
    "email": "sofiflores11408@gmail.com",
    "apellido": "Sofía",
    "nombre": "Flores",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "44158595",
    "email": "solgimeneezz@gmail.com",
    "apellido": "Sol",
    "nombre": "Gimenez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46874893",
    "email": "laraguaimas2@gmail.com",
    "apellido": "Lara Malen",
    "nombre": "Cruz Guaimas",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45748312",
    "email": "marcoalsina70@gmail.com",
    "apellido": "Marcos Alessandro",
    "nombre": "González maqueda",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "37339442",
    "email": "antonellabrizuela93@gmail.com",
    "apellido": "Alejandra",
    "nombre": "Brizuela",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46872552",
    "email": "eugeplanas20@gmail.com",
    "apellido": "Eugenia Carla",
    "nombre": "Planas",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44510222",
    "email": "saliturijulieta@gmail.com",
    "apellido": "Julieta Denise",
    "nombre": "Salituri",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46297822",
    "email": "dharmabailettib@gmail.com",
    "apellido": "Dharma",
    "nombre": "Barbagallo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "37932891",
    "email": "reyesdiego2910@gmail.com",
    "apellido": "Diego",
    "nombre": "Reyes",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "41132919",
    "email": "jcy16_10@hotmail.com",
    "apellido": "Juan Cruz",
    "nombre": "Ibarra",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "44610958",
    "email": "jhaedo28@gmail.com",
    "apellido": "Julieta",
    "nombre": "Haedo",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "43817519",
    "email": "lola.guillenflor@gmail.com",
    "apellido": "lola",
    "nombre": "guillen",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "41394773",
    "email": "costamarisaga@gmail.com",
    "apellido": "Marisa Gabriela",
    "nombre": "Costa",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "47199424",
    "email": "camilarojasvelez22@gmail.com",
    "apellido": "Camila",
    "nombre": "Rojas",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "46069256",
    "email": "delfinagenini@gmail.com",
    "apellido": "Delfina",
    "nombre": "Genini",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45750806",
    "email": "tauroaylen@gmail.com",
    "apellido": "Aylen",
    "nombre": "Tauro",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44482589",
    "email": "sofiamicarodri@gmail.com",
    "apellido": "Sofía Micaela",
    "nombre": "Rodríguez",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43508307",
    "email": "nereagiuliana1@gmail.com",
    "apellido": "Nerea",
    "nombre": "Salerno",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "52219367",
    "email": "sebastianperezreiter@gmail.com",
    "apellido": "Sebastián Lautaro",
    "nombre": "Pérez Reiter",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43722555",
    "email": "barbararedondal@gmail.com",
    "apellido": "Bárbara",
    "nombre": "Redondal",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43979094",
    "email": "valen.cohener@gmail.com",
    "apellido": "Valentina",
    "nombre": "Cohener",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "38934222",
    "email": "vbaryuk@gmail.com",
    "apellido": "Victoria",
    "nombre": "Baryuk",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "96385112",
    "email": "paulanicoletbarreiro@gmail.com",
    "apellido": "Paula",
    "nombre": "Barreiro",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "35361454",
    "email": "anigluj@gmail.com",
    "apellido": "Anabella",
    "nombre": "Gluj",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "41921587",
    "email": "abrilola1@gmail.com",
    "apellido": "Abril",
    "nombre": "Pastorino Font",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "37904247",
    "email": "valen.jauregui@gmail.com",
    "apellido": "Valentina",
    "nombre": "Jauregui",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "95468558",
    "email": "rocilm2030@gmail.com",
    "apellido": "Rocio",
    "nombre": "Marquez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42596174",
    "email": "agustin.em.coronel@gmail.com",
    "apellido": "Agustin",
    "nombre": "Coronel",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "21832753",
    "email": "clr.diegobennett@gmail.com",
    "apellido": "Diego Enrique",
    "nombre": "Bennett",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "32636166",
    "email": "marcelapruzello@gmail.com",
    "apellido": "Marcela",
    "nombre": "Pruzello",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "45824389",
    "email": "casandra.ragusa@gmail.com",
    "apellido": "Casandra",
    "nombre": "Ragusa Inhouds",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "24963490",
    "email": "geraldlanteri@gmail.com",
    "apellido": "Geraldine",
    "nombre": "Lanteri",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "24446659",
    "email": "mariayor33@gmail.com",
    "apellido": "Maria",
    "nombre": "Castro",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43087931",
    "email": "katia.scotoveru2@gmail.com",
    "apellido": "Katia",
    "nombre": "Scotover",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "27812648",
    "email": "viatagle@hotmail.com",
    "apellido": "Victoria",
    "nombre": "Alvarez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43049600",
    "email": "kiaragrandi824@gmail.com",
    "apellido": "Kiara",
    "nombre": "Grandi",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "46616986",
    "email": "mercedescastellano25@gmail.com",
    "apellido": "Mercedes",
    "nombre": "Castellano",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46345270",
    "email": "malex15leiva@gmail.com",
    "apellido": "Malena",
    "nombre": "Leiva",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "95817056",
    "email": "tbocanegram9@gmail.com",
    "apellido": "Tatiana",
    "nombre": "BOCANEGRA",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43736522",
    "email": "frittzcamila@gmail.com",
    "apellido": "Camila",
    "nombre": "Fritz",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46366439",
    "email": "lulabicco@gmail.com",
    "apellido": "Lucía",
    "nombre": "Bicco López",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "95729625",
    "email": "soledadg7@gmail.com",
    "apellido": "Soledad",
    "nombre": "Gonzalez",
    "carrera": "Antropología",
    "porcentaje_beca": 100
  },
  {
    "dni": "42732410",
    "email": "sofiaroh21@gmail.com",
    "apellido": "sofia",
    "nombre": "roh",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46877103",
    "email": "catherinadezarlo@gmail.com",
    "apellido": "Catherina",
    "nombre": "De Zarlo",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "46753885",
    "email": "giulianassosa@gmail.com",
    "apellido": "Giuliana Martina",
    "nombre": "Sosa",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "32437586",
    "email": "melfer2017@gmail.com",
    "apellido": "Melina Celeste",
    "nombre": "Fernández Jofré",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41134926",
    "email": "lmuozat@gmail.com",
    "apellido": "Lucia",
    "nombre": "Muñoz",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "28892104",
    "email": "doniamime@gmail.com",
    "apellido": "MIMENA MARIA",
    "nombre": "PARRA",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "47643924",
    "email": "juanafetonte13@gmail.com",
    "apellido": "Juana",
    "nombre": "Fetonte",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "41308764",
    "email": "lautarownieto@gmail.com",
    "apellido": "Lautaro Walter",
    "nombre": "Nieto",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47481220",
    "email": "febenavidez@icloud.com",
    "apellido": "Federica",
    "nombre": "Benavidez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44357161",
    "email": "pierinabazan02@gmail.com",
    "apellido": "Pierina",
    "nombre": "Ponti",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "96001109",
    "email": "livictoriasan@gmail.com",
    "apellido": "Li Victoria",
    "nombre": "Sánchez Diaz",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "96473535",
    "email": "anahelena.castilho@gmail.com",
    "apellido": "Ana Helena",
    "nombre": "Leiva de Castilho",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "18405060",
    "email": "marcella282009@hotmail.com",
    "apellido": "Marcela Fabiana",
    "nombre": "Almada",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "42365702",
    "email": "denise_mohr@hotmail.com",
    "apellido": "Denise",
    "nombre": "Mohr",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "95575935",
    "email": "gabrielavasquez1328@gmail.com",
    "apellido": "gabriela",
    "nombre": "vasquez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46335163",
    "email": "matveukcamila@gmail.com",
    "apellido": "Camila",
    "nombre": "Matveuk",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "45616454",
    "email": "mendizabalrenata@gmail.com",
    "apellido": "Renata",
    "nombre": "Mendizabal",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "44937514",
    "email": "taliamaylen@gmail.com",
    "apellido": "Talia Maylen",
    "nombre": "Villalva",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41577519",
    "email": "noewasilewski@gmail.com",
    "apellido": "Noelia",
    "nombre": "Wasilewski",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "47095827",
    "email": "lourdesbarrozo06@gmail.com",
    "apellido": "Lourdes",
    "nombre": "Barrozo",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "2942974",
    "email": "monabisiesta.films@gmail.com",
    "apellido": "Rosario",
    "nombre": "Palma",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "46682967",
    "email": "medinamicaela256@gmail.com",
    "apellido": "Micaela Aylen",
    "nombre": "Medina",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "44449844",
    "email": "franciscodurruty2002@gmail.com",
    "apellido": "Francisco",
    "nombre": "Durruty",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "21484798",
    "email": "evamariamarabotto@gmail.com",
    "apellido": "Eva",
    "nombre": "Marabotto",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "40234531",
    "email": "mcmacaluse@gmail.com",
    "apellido": "María Celeste",
    "nombre": "Macaluse",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 100
  },
  {
    "dni": "46875041",
    "email": "candematassa05@gmail.com",
    "apellido": "Candela Jimena",
    "nombre": "Matassa",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "45463413",
    "email": "noelia.rodriguezs.2003@gmail.com",
    "apellido": "Noelia",
    "nombre": "Rodriguez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "32800809",
    "email": "tomasjrodera@gmail.com",
    "apellido": "Tomás",
    "nombre": "Rodera",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "43517904",
    "email": "ramirocasos@gmail.com",
    "apellido": "Ramiro",
    "nombre": "Casos",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "33862350",
    "email": "eliana.r.s.freire@gmail.com",
    "apellido": "Eliana Rocío Salomé",
    "nombre": "Freire",
    "carrera": "Edición",
    "porcentaje_beca": 100
  },
  {
    "dni": "46362446",
    "email": "manuelarodriguez1250@gmail.com",
    "apellido": "Manuela",
    "nombre": "Rodríguez",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "45419570",
    "email": "coronelcamino@gmail.com",
    "apellido": "Camilo",
    "nombre": "Pérez Luque",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46793851",
    "email": "montesurbanskipilar@gmail.com",
    "apellido": "María Pilar",
    "nombre": "Montes Urbanski",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "47574675",
    "email": "gastonvainer31@gmail.com",
    "apellido": "Gastón",
    "nombre": "Vainer Macchioli",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "47755597",
    "email": "veltrmilena@gmail.com",
    "apellido": "Milena Ixchel",
    "nombre": "Veltri",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "43898712",
    "email": "victoriafarias281@gmail.com",
    "apellido": "Maria Victoria",
    "nombre": "Farias",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "45580529",
    "email": "raffaelesofi@gmail.com",
    "apellido": "Sofia",
    "nombre": "Raffaele",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "14887400",
    "email": "ana.valle.uba.24@gmail.com",
    "apellido": "Ana",
    "nombre": "Valle",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "42100236",
    "email": "malegerbasi@gmail.com",
    "apellido": "malena",
    "nombre": "gerbasi",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "35363976",
    "email": "calabresemguadalupe@gmail.com",
    "apellido": "Guadalupe",
    "nombre": "Calabrese",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "41003117",
    "email": "mbssalazar98@gmail.com",
    "apellido": "Bernardita",
    "nombre": "Salazar",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "37978446",
    "email": "dana.palumbo@bue.edu.ar",
    "apellido": "Dana Eva",
    "nombre": "Palumbo",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "39925247",
    "email": "disalloaye.oca@gmail.com",
    "apellido": "Ayelén",
    "nombre": "Ocampos Di Sallo",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "13404985",
    "email": "adrianarossi6@hotmail.com",
    "apellido": "Adriana",
    "nombre": "ROSSI",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "42213604",
    "email": "cami_giselle_12@hotmail.com",
    "apellido": "Camila",
    "nombre": "Gomez",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "52222068",
    "email": "josefinapitameglio@gmail.com",
    "apellido": "josefina",
    "nombre": "pitameglio",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43000865",
    "email": "tomasnahuelpardo4@gmail.com",
    "apellido": "Tomas Nahuel",
    "nombre": "Pardo",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "18814962",
    "email": "villagrarosalina768@gmail.com",
    "apellido": "Rosalina",
    "nombre": "Villagra",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "38069629",
    "email": "frubachin@gmail.com",
    "apellido": "Federico",
    "nombre": "Rubachin",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "47758949",
    "email": "ulisesgoyocaso@gmail.com",
    "apellido": "Ulises",
    "nombre": "Goyo Caso",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43001215",
    "email": "juanodagled@gmail.com",
    "apellido": "Juan",
    "nombre": "Delgado",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "32481689",
    "email": "japorfirio12@gmail.com",
    "apellido": "Jorge",
    "nombre": "Porfirio",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "44322325",
    "email": "paulapalomeque02@gmail.com",
    "apellido": "Ana Paula",
    "nombre": "Palomeque",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46002600",
    "email": "ferreyroagustin@gmail.com",
    "apellido": "Sergio Agustin",
    "nombre": "Ferreyro",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "27778862",
    "email": "mlaurapi12@gmail.com",
    "apellido": "Maria Laura",
    "nombre": "Piñeiro",
    "carrera": "Historia",
    "porcentaje_beca": 100
  },
  {
    "dni": "43469835",
    "email": "milafarina05@gmail.com",
    "apellido": "Camila",
    "nombre": "Fariña",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "42288863",
    "email": "cruz.emilceluciana@gmail.com",
    "apellido": "Emilce",
    "nombre": "Cruz",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "46030205",
    "email": "joagargiulo@gmail.com",
    "apellido": "Joaquín",
    "nombre": "Gargiulo",
    "carrera": "Geografía",
    "porcentaje_beca": 50
  },
  {
    "dni": "96092138",
    "email": "jfloresblanc@gmail.com",
    "apellido": "Juan Ignacio",
    "nombre": "Flores Blanc",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "44155945",
    "email": "isataggi@gmail.com",
    "apellido": "Isabella",
    "nombre": "Taggiasco",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47165061",
    "email": "morebaudo@gmail.com",
    "apellido": "Morena",
    "nombre": "Baudo",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "41385813",
    "email": "maunicopetit@hotmail.com",
    "apellido": "Mauro",
    "nombre": "Petit",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "39911483",
    "email": "santiagoniemtzoff12@gmail.com",
    "apellido": "Santiago",
    "nombre": "Niemtzoff",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "46116480",
    "email": "eleonorvgnst@gmail.com",
    "apellido": "Eleonora Abril",
    "nombre": "Aller Bozzano",
    "carrera": "Filosofía",
    "porcentaje_beca": 50
  },
  {
    "dni": "45402664",
    "email": "ludmiladaniela3@gmail.com",
    "apellido": "Ludmila",
    "nombre": "Suarez",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "46346949",
    "email": "damarisvvidan@gmail.com",
    "apellido": "Damaris",
    "nombre": "Vidan",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "28630699",
    "email": "vanu125@gmail.com",
    "apellido": "Vanina",
    "nombre": "Uñates",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "39207293",
    "email": "huamaan.sosa@gmail.com",
    "apellido": "Huaman Gabriel",
    "nombre": "Sosa Lenton",
    "carrera": "Historia",
    "porcentaje_beca": 50
  },
  {
    "dni": "43111189",
    "email": "ruizdiazayalaconstanza@gmail.com",
    "apellido": "Constanza",
    "nombre": "Ruiz Diaz",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43919499",
    "email": "lailalopez913@gmail.com",
    "apellido": "Laila",
    "nombre": "López",
    "carrera": "Educación",
    "porcentaje_beca": 50
  },
  {
    "dni": "44675498",
    "email": "mateomontillasuarez@gmail.com",
    "apellido": "Mateo",
    "nombre": "Montilla Suárez",
    "carrera": "Artes/ Tecnicatura en producción y gestión de las artes",
    "porcentaje_beca": 50
  },
  {
    "dni": "43081914",
    "email": "verdugamarcos@gmail.com",
    "apellido": "Marcos",
    "nombre": "Verduga Santillan",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "44613401",
    "email": "rafaelsesto7@gmail.com",
    "apellido": "Rafael",
    "nombre": "Sesto",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "41173134",
    "email": "flor_ronchi@hotmail.com",
    "apellido": "Maria Florencia",
    "nombre": "Ronchi",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "32321557",
    "email": "profe.coach.jeretustra@gmail.com",
    "apellido": "JEREMIAS",
    "nombre": "GOMEZ RYHR",
    "carrera": "Filosofía",
    "porcentaje_beca": 100
  },
  {
    "dni": "43407191",
    "email": "rochiaguer@gmail.com",
    "apellido": "Rocío",
    "nombre": "Agüero",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "47218023",
    "email": "almendragrandi@gmail.com",
    "apellido": "Almendra",
    "nombre": "Grandi",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "43446274",
    "email": "lulitrucco22@gmail.com",
    "apellido": "Luciana",
    "nombre": "Trucco",
    "carrera": "Antropología",
    "porcentaje_beca": 50
  },
  {
    "dni": "43321485",
    "email": "julietapastorino@gmail.com",
    "apellido": "Julieta",
    "nombre": "Pastorino",
    "carrera": "Letras",
    "porcentaje_beca": 50
  },
  {
    "dni": "35962801",
    "email": "nformentti@gmail.com",
    "apellido": "Natalia",
    "nombre": "Formentti",
    "carrera": "Bibliotecología/ Tecnicatura en archivística",
    "porcentaje_beca": 50
  },
  {
    "dni": "36319227",
    "email": "rociovarelac@gmail.com",
    "apellido": "Rocío",
    "nombre": "Varela casanovas",
    "carrera": "Edición",
    "porcentaje_beca": 50
  },
  {
    "dni": "31650852",
    "email": "fercrespofc@gmail.com",
    "apellido": "Fernando",
    "nombre": "Crespo",
    "carrera": "Educación",
    "porcentaje_beca": 100
  },
  {
    "dni": "43242038",
    "email": "vickypascarellib@gmail.com",
    "apellido": "María Victoria",
    "nombre": "Pascarelli Balbi",
    "carrera": "Letras",
    "porcentaje_beca": 50
  }
];

const normalizeDni = (value: unknown) => String(value ?? "").trim().replace(/[,.s]/g, "");
const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const buildFullName = (user: ImportUser) => `${user.apellido} ${user.nombre}`.trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const start = Math.max(0, Number(body?.start ?? 0));
    const limit = Math.max(1, Math.min(150, Number(body?.limit ?? 100)));
    const batch = users.slice(start, start + limit);

    if (batch.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, created: 0, updated_becas: 0, inserted_becas: 0, profiles_inserted: 0, profiles_updated: 0, roles_inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const [profilesRes, rolesRes, becasRes] = await Promise.all([
      adminClient.from("profiles").select("id, user_id, email, dni, nombre_completo, carrera").limit(5000),
      adminClient.from("user_roles").select("user_id, role").limit(5000),
      adminClient.from("becas").select("id, user_id, tipo, estado, fecha_inicio").limit(5000),
    ]);

    if (profilesRes.error) throw profilesRes.error;
    if (rolesRes.error) throw rolesRes.error;
    if (becasRes.error) throw becasRes.error;

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];
    const becas = becasRes.data || [];

    const profilesByEmail = new Map(profiles.map((profile) => [normalizeEmail(profile.email), profile]));
    const profilesByDni = new Map(profiles.map((profile) => [normalizeDni(profile.dni), profile]));
    const roleKeys = new Set(roles.map((role) => `${role.user_id}:${role.role}`));
    const becaByUser = new Map<string, (typeof becas)[number]>();
    for (const beca of becas) {
      if (!becaByUser.has(beca.user_id)) becaByUser.set(beca.user_id, beca);
    }

    const authUsers: Array<{ id: string; email?: string | null }> = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const currentUsers = data?.users || [];
      authUsers.push(...currentUsers.map((user) => ({ id: user.id, email: user.email })));
      if (currentUsers.length < perPage) break;
      page += 1;
    }

    const authByEmail = new Map(authUsers.map((user) => [normalizeEmail(user.email), user]));
    const today = new Date().toISOString().split("T")[0];
    const results = {
      success: true,
      processed: batch.length,
      created: 0,
      existing: 0,
      profiles_inserted: 0,
      profiles_updated: 0,
      roles_inserted: 0,
      becas_inserted: 0,
      becas_updated: 0,
      errors: [] as string[],
    };

    let cursor = 0;
    const concurrency = Math.min(6, batch.length || 1);

    const processUser = async () => {
      while (cursor < batch.length) {
        const user = batch[cursor++];
        const email = normalizeEmail(user.email);
        const dni = normalizeDni(user.dni);
        const nombreCompleto = buildFullName(user);

        try {
          let profile = profilesByEmail.get(email) || profilesByDni.get(dni);
          let userId = profile?.user_id || authByEmail.get(email)?.id;

          if (!userId) {
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
              email,
              password: dni,
              email_confirm: true,
              user_metadata: {
                nombre_completo: nombreCompleto,
                dni,
                carrera: user.carrera,
              },
            });

            if (createError || !newUser?.user) {
              results.errors.push(`Error creando ${email}: ${createError?.message || "No se pudo crear el usuario"}`);
              continue;
            }

            userId = newUser.user.id;
            authByEmail.set(email, { id: newUser.user.id, email });
            results.created += 1;
          } else {
            results.existing += 1;
          }

          if (profile) {
            const needsProfileUpdate = profile.nombre_completo !== nombreCompleto || normalizeEmail(profile.email) !== email || normalizeDni(profile.dni) !== dni || (profile.carrera || "") !== user.carrera;
            if (needsProfileUpdate) {
              const { error: profileUpdateError } = await adminClient.from("profiles").update({
                nombre_completo: nombreCompleto,
                email,
                dni,
                carrera: user.carrera,
              }).eq("id", profile.id);
              if (profileUpdateError) throw profileUpdateError;
              profile = { ...profile, nombre_completo: nombreCompleto, email, dni, carrera: user.carrera };
              profilesByEmail.set(email, profile);
              profilesByDni.set(dni, profile);
              results.profiles_updated += 1;
            }
          } else {
            const { data: insertedProfile, error: profileInsertError } = await adminClient.from("profiles").insert({
              user_id: userId,
              nombre_completo: nombreCompleto,
              email,
              dni,
              carrera: user.carrera,
            }).select("id, user_id, email, dni, nombre_completo, carrera").single();
            if (profileInsertError) throw profileInsertError;
            profile = insertedProfile;
            profilesByEmail.set(email, profile);
            profilesByDni.set(dni, profile);
            results.profiles_inserted += 1;
          }

          const roleKey = `${userId}:student`;
          if (!roleKeys.has(roleKey)) {
            const { error: roleError } = await adminClient.from("user_roles").insert({ user_id: userId, role: "student" });
            if (roleError) throw roleError;
            roleKeys.add(roleKey);
            results.roles_inserted += 1;
          }

          const becaTipo = user.porcentaje_beca === 100 ? "100" : user.porcentaje_beca === 50 ? "50" : null;
          if (becaTipo) {
            const existingBeca = becaByUser.get(userId);
            if (existingBeca) {
              if (existingBeca.tipo !== becaTipo || existingBeca.estado !== "aprobada" || !existingBeca.fecha_inicio) {
                const { error: becaUpdateError } = await adminClient.from("becas").update({
                  tipo: becaTipo,
                  estado: "aprobada",
                  fecha_inicio: existingBeca.fecha_inicio || today,
                }).eq("id", existingBeca.id);
                if (becaUpdateError) throw becaUpdateError;
                becaByUser.set(userId, { ...existingBeca, tipo: becaTipo, estado: "aprobada", fecha_inicio: existingBeca.fecha_inicio || today });
                results.becas_updated += 1;
              }
            } else {
              const { data: newBeca, error: becaInsertError } = await adminClient.from("becas").insert({
                user_id: userId,
                tipo: becaTipo,
                estado: "aprobada",
                fecha_inicio: today,
              }).select("id, user_id, tipo, estado, fecha_inicio").single();
              if (becaInsertError) throw becaInsertError;
              becaByUser.set(userId, newBeca);
              results.becas_inserted += 1;
            }
          }
        } catch (error) {
          results.errors.push(`Error procesando ${email}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => processUser()));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
