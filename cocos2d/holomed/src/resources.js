// Resources prefix
var s_resprefix = "res/";

var s_pathClose = "res/Images/close.png";

var s_dragon_animation = "res/animations/dragon_animation.png";

var image1 = "res/Images/fly0000.png";

var s_baby_rotation = "res/Images/Sprite_Gimp_1024x600_2.png";
//var test_size_png = "res/Images/fase1.png";
var s_phases_frontal = 
	"res/Images/Spritesheets/Front/Fase_1_40-79.png,\
res/Images/Spritesheets/Front/Fase_2_80-119.png,\
res/Images/Spritesheets/Front/Fase_3_120-159.png,\
res/Images/Spritesheets/Front/Fase_4_160-199.png,\
res/Images/Spritesheets/Front/Fase_5_200-239.png,\
res/Images/Spritesheets/Front/Fase_6_240-279.png,\
res/Images/Spritesheets/Front/Fase_7_280-320.png,\
res/Images/Spritesheets/Front/Fase_8_320.png";

var s_phases_left = 
	"res/Images/Spritesheets/Left/Fase_1_40-79.png,\
res/Images/Spritesheets/Left/Fase_2_80-119.png,\
res/Images/Spritesheets/Left/Fase_3_120-159.png,\
res/Images/Spritesheets/Left/Fase_4_160-199.png,\
res/Images/Spritesheets/Left/Fase_5_200-239.png,\
res/Images/Spritesheets/Left/Fase_6_240-279.png,\
res/Images/Spritesheets/Left/Fase_7_280-319.png,\
res/Images/Spritesheets/Left/Fase_8_320.png";

var s_phases_right = 
	"res/Images/Spritesheets/Right/Fase_1_40-79.png,\
res/Images/Spritesheets/Right/Fase_2_80-119.png,\
res/Images/Spritesheets/Right/Fase_3_120-159.png,\
res/Images/Spritesheets/Right/Fase_4_160-199.png,\
res/Images/Spritesheets/Right/Fase_5_200-239.png,\
res/Images/Spritesheets/Right/Fase_6_240-279.png,\
res/Images/Spritesheets/Right/Fase_7_280-319.png,\
res/Images/Spritesheets/Right/Fase_8_320.png";

var s_phases_frontal_rotations = 
	"res/Images/Spritesheets/Rotations/Fase_1_40-79.png";

var s_instruction_message = "Recuerde, si desea rotar el feto, alce la mano izquierda.\
Puede hacerlo las veces que quiera.\
Si en cambio desea continuar con la siguiente lección,\
alce la mano derecha";

var s_phases_frontal_sheet = s_phases_frontal.split(',');
var s_phases_left_sheet = s_phases_left.split(',');
var s_phases_right_sheet = s_phases_right.split(',');

var s_phases_frontal_rotations_sheet = s_phases_frontal_rotations.split(',');


var g_resources = [
    //global
    s_baby_rotation,
    s_pathClose,
];

g_resources = g_resources.concat(s_phases_frontal_sheet);
g_resources = g_resources.concat(s_phases_left_sheet);
g_resources = g_resources.concat(s_phases_right_sheet);

g_resources = g_resources.concat(s_phases_frontal_rotations_sheet);

var g_sprites = [
];

var s_instruction_message = 'Bienvenido a Holomed, el sistema holográfico \
para la enseñanza del parto eutócico simple. A continuación le será explicado \
cada una de las fases, seguido de un custionario. Si contesta correctamente las preguntas, \
se le sumarán puntos que indicarán su desempeño. Buena suerte. Por favor, alce la mano izquierda,\
si quiere volver a oir este mensaje. Para empezar la lección, alce la mano derecha';
