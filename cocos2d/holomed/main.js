/****************************************************************************
 
 Inicializa la aplicacion como tal

 *
 */

cc.game.onStart = function(){
    
    cc.view.resizeWithBrowserSize(true);
    cc.LoaderScene.preload(g_resources, function () {
    	cc.director.runScene(new HolomedController());
    }, this);
};
cc.game.run();
