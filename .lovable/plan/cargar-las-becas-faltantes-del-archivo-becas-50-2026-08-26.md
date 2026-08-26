# Cargar las becas faltantes del archivo BECAS_50

## Situación actual

El archivo tiene 509 filas (508 DNI únicos). Comparando contra la base:

- 462 ya están cargados con su beca.
- **46 no existen en el sistema** (ni usuario ni beca). Todos son beca del 50%.
- Ninguno de los ya existentes quedó sin beca.

Son 46 y no 41; la diferencia probablemente sea por casos con datos raros (ver abajo).

## Usuarios faltantes (46)

Todos con beca 50%:

Vazquez Bambill Guadalupe Pilar (42029001), Mamani Veliz Araceli (46365120), Rios Thomas (43100603), Rodríguez Sofía Micaela (44482589), Orellano Rocio Maribel (43396255), Oliva Schejter Ada (47961653), **Orlando Lola (DNI figura como "63")**, Sfeir Catalina (44851173), Davalli Martina (43030555), Coronel Rocío (45237464), Bellusci Catalina (46269653), Vecchio Violeta (46499674), Delgado Antonella Belén (40767300), Roa Nicolas (33155353), Sandez Ambar Luciana (45518246), Nuñez Gerónimo Abril (44714932), Permayú Maira (43404501), Baroli Greslebin Malena (48046051), Montoya Rodríguez Pablo (43175131), Maya Felipe Hugo (46908446), San Martín Marcos Alexander (43472939), Stok Lautaro (47435826), Costilla Micaela (38071663), Diaz Pereira Ezequiel (40857214), Almaraz Rocío Shaiel (45303864), Hass Milagros (42660069), Suárez Valentina (45820678), Sandoval Jorgelina (46425502), Mattia Manuel (47023420), Rubio Moran Abril Kiara (47298084), Hequera Lucila Luna (44482031), Trangoni Maira (41308726), Lazzari Lanusse Julia (47030634), Perelli Maitena (46756419), Scally Matías (43196226), ramirez camila (45239495), Martínez Acosta Candelaria (47031263), Panusopulos Irina (46123661), Planas Eugenia (46872552), Ziliotto Sol Mailen (40904156), Cohener Valentina (43979094), Fetonte Juana (47643924), Rios Gomez Ana (45825619), Giordano Alma (47454041), Ávalos Juárez Daniela (41622676), Flores Candelaria (44361310).

## Qué se hace

1. Crear la cuenta de cada uno de los 45 con DNI válido (contraseña = DNI, email confirmado), su perfil con carrera, su rol de estudiante y su beca del 50% en estado aprobada.
2. Si el email ya tuviera cuenta creada sin perfil, se repara en vez de duplicar.
3. Al terminar, informar el listado cargado y los casos con problemas.

**Lola Orlando** queda pendiente: su DNI en el Excel es "63", que no es un documento válido y no sirve como contraseña. Se carga aparte cuando pases el DNI real.

## Detalle técnico

- Se usa la función existente `bulk-create-users` (acciones de alta y `repair_users`), invocada con las 45 filas faltantes normalizadas (DNI sin puntos, email en minúscula, `nombre_completo` = "Apellido Nombre", `porcentaje_beca` = 50).
- No requiere cambios de esquema ni de la interfaz; es una carga de datos puntual.
