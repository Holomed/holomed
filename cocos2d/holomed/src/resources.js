// Resources prefix
var s_resprefix = "res/";

var s_pathClose = "res/Images/close.png";

var s_dragon_animation = "res/animations/dragon_animation.png";

var image1 = "res/Images/fly0000.png";

var s_baby_rotation = "res/Images/Sprite_Gimp_1024x600_2.png";
//var test_size_png = "res/Images/fase1.png";
var s_phases_frontal = 
	"res/Images/phases/Fase_1_40-79.png,\
res/Images/phases/Fase_2_80-119.png,\
res/Images/phases/Fase_3_120-159.png,\
res/Images/phases/Fase_4_160-199.png,\
res/Images/phases/Fase_5_200-239.png,\
res/Images/phases/Fase_6_240-279.png,\
res/Images/phases/Fase_7_280-320.png,\
res/Images/phases/Fase_8_320.png";

var s_instruction_message = "Recuerde, si desea rotar el feto, alce la mano izquierda.\
Puede hacerlo las veces que quiera.\
Si en cambio desea continuar con la siguiente lección,\
alce la mano derecha";

var s_phases_frontal_sheets = s_phases_frontal.split(',');

var g_resources = [
    //global
    s_baby_rotation,
    s_pathClose,
];

g_resources = g_resources.concat(s_phases_frontal_sheets);

var g_sprites = [
];
