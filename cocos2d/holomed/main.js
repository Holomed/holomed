/****************************************************************************
 
 Inicializa la aplicacion como tal

 *
 */

cc.game.onStart = function(){
    
    if (cc.sys.isNative) {
        cc.view.setDesignResolutionSize(800, 450, cc.ResolutionPolicy.FIXED_HEIGHT);
        cc.view.resizeWithBrowserSize(true);
    }
    
    cc.LoaderScene.preload(g_resources, function () {
        if(window.sideIndexBar && typeof sideIndexBar.start === 'function'){
            sideIndexBar.start();
        }else{
            cc.director.runScene(new TestController());
        }
    }, this);
};
cc.game.run();
