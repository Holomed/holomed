/****************************************************************************
 
 Inicializa la aplicacion de la derecha para el monitoreo

 *
 */

cc.game.onStart = function(){
    
    
    cc.LoaderScene.preload(g_resources, function () {
    	cc.director.runScene(new HolomedRightScene(););
    }, this);
};
cc.game.run();
