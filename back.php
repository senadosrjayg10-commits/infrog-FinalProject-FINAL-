<?php
    $weather = isset($_POST["subweather"]) ? $_POST["subweather"] : null;

    if (isset($weather)){
        $weatherCondition = $weather;

        switch($weatherCondition){
            case "Sunny":
                echo "Hilo godmurneng!";
                break;
            default:
                echo "ERROR!";    
        }
    }
?>