/**
 * Intro:use ffmpeg split video to images
 * Date:2018/9/25
 *
 * "Life is like riding a bicycle. To keep your balance, you must keep moving." - Albert Einstein
 *
 *                      。
 *      。               ~!,
 *     ~*                ~*@:
 *    !=-                ~:#@
 *   .@;~                  @#
 *    #&  ...~;=&&&&&&&=!~,
 *      ,:%%&!:~~~~~::;!*&%%@#,
 *     .@@~                  !@
 *     &@#                .~&&
 *     #@#-.          &%%@&=!   #@@~     =@#;
 *     .=@@@#&&*!!!;;:~.        @@@.     ,@
 *        -:;!!*=&%%@@@@@*     ~@@;
 *                    ,:@@#    &@@&@&* :&#@#. %%       .!%%*.
 *        -%%-          @@&   .@@!&@@!  *@@-  @@@@@@@ ,@@  @@
 *        ,&@=       ~*&#:    -@& @@=   &@*  .@@~ @@* :@@&@@@：
 *          .;=%%#&*:,..      =@  @@.   @@   ;@=  @@  ~@         *:#。
 *                            @. .@=    @-   &@   @.   @@@@@      .:*#@@@@@&*;-
 *                           ,#  #@:                                          &#~
 *                               @@:                                           *#~
 *                               *@;                              .!          *#~
 *                                @#                           .-&#@@@@@@@%%&~
 *                                 !~                        ~;!&%%.
 *
 */

const exec = require('child_process').exec;

const video = 'test360video.mp4';


exec(`ffmpeg -i ${video}`, (err, stdout, stderr) => {
    const outStr = stderr.toString();
    const regDuration = /Duration\: ([0-9\:\.]+),/;
    const rs = regDuration.exec(outStr);
    if (rs[1]) {
        const times = rs[1].split(':');
        const sec = parseFloat(times[2], 10) + parseInt(times[1]) * 60 + parseInt(times[0]) * 60 * 60;
        const frameNo = (72 / sec).toFixed(2);
        const comand = `ffmpeg -i ${video} -y -r ${frameNo} public/images/frame-%01d.jpg`;
        console.log(comand);
        exec(comand, (err, out) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('success');
        });
    }
});
