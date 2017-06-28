<?php

/**
 * Database Configuration
 *
 * All of your system's database configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/db.php
 */

return array(
    '*' => array(
        'tablePrefix' => 'craft',
    ),
    '.dev'  => array(
        'server' => 'localhost',
        'database' => 'bti2.dev',
        'user' => 'bti2.dev',
        'password' => 'bti2.dev',
        'tablePrefix' => 'craft',
    ),
    '128.199.51.224' => array(
        'server' => 'localhost',
        'database' => 'bti2.dev',
        'user' => 'bti2.dev',
        'password' => 'bti2.dev',
        'tablePrefix' => 'craft',
    )
);
