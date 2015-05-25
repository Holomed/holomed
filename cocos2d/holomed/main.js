/****************************************************************************
 
 Inicializa la aplicacion como tal

 *
 */

cc.game.onStart = function(){
    
    //cc.view.setDesignResolutionSize(800, 600, cc.ResolutionPolicy.SHOW_ALL);
    //cc.view.setResolutionPolicy(cc.ResolutionPolicy.NO_BORDER);
    //cc.view.resizeWithBrowserSize(true);
    
    cc.LoaderScene.preload(g_resources, function () {
    	cc.director.runScene(new TestController());
    }, this);
};
cc.game.run();
