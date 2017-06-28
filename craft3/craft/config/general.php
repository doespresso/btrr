<?php


return array(
    '*'  => array(
        'defaultWeekStartDay' => 0,
        'enableCsrfProtection' => true,
        'omitScriptNameInUrls' => true,
        'cpTrigger' => 'admin',
        'siteName' => array(
            'ru' => 'Бейкер Тилли Россия',
            'en_us' => 'Baker Tilly Russia',
        ),
//        'devMode' => true,
    ),
    '.dev' => array(
        //	'cacheMethod' => "db",
        'siteUrl' => array(
            'ru' => 'http://bti3.dev/',
            'en_us' => 'http://bti3.dev/en/',
        ),
        'environmentVariables' => array(
            'basePath' => '/users/jd/vh/bti.dev/craft3/web/',
            'baseUrl' => 'http://bti3.dev/',
            'assetsUrl' => 'http://localhost:3000/assets/',
        ),
        'devMode' => true,
    ),
//    '128.199.51.224'  => array(
//        'siteUrl' => array(
//            'ru' => 'http://128.199.51.224/',
//            'en_us' => 'http://128.199.51.224/en/',
//        ),
//        'environmentVariables' => array(
//            'basePath' => '/var/www/html/bti.dev/craft2/public/',
//            'baseUrl' => 'http://128.199.51.224/',
//            'assetsUrl' => 'http://128.199.51.224/assets/',
//        ),
//        'devMode' => false,
//    )
);