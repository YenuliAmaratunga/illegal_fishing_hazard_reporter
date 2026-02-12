import { useRoute ,useNavigation} from "@react-navigation/native";
import React, { useState } from "react";
import { View,TouchableOpacity,TextInput,Text } from "react-native";


export default function LoginScreen(){


    const route = useRoute();
    //const {language} = route.params;
     const language = route.params?.language ?? "en";
     const navigation = useNavigation();

    const translation = {

        si:{

            ngo : "ඔබගේ එන්ජීඕ ගිණුමට පිවිසෙන්න",
            fisherman : "ඔබගේ මත්ස්‍යකර්මික ගිණුමට පිවිසෙන්න",
            marine : "ඔබගේ මරීන් පොලිස් නිලධාරී ගිණුමට පිවිසෙන්න",
            choose : "පිවිසුම් වර්ගය තෝරන්න"

          
        },

        en : {

            ngo : "Login to Your NGO Account",
            fisherman : "Login to Your Fisherman Account",
            marine : "Login to Your Marine Police Officer Account",
            choose : "Choose Login Type"


           
        },

        ta : {

            ngo : "உங்கள் என்.ஜி.ஓ கணக்கில் உள்நுழைக",
            fisherman : "உங்கள் மீனவர் கணக்கில் உள்நுழைக",
            marine : "உங்கள் கடற்படை காவல்துறை அதிகாரி கணக்கில் உள்நுழைக",
            choose : "உள்நுழைவு வகையைத் தேர்ந்தெடுக்கவும்"
            
        }
    }

    const goToForm = (role) => {
    navigation.navigate("RoleLogin", {  language,role });
  };

    return(
       <View className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-2xl font-bold text-center mb-8 text-gray-800">{translation[language].choose}</Text>
       <TouchableOpacity
       className="bg-green-500 rounded-2xl w-full py-8 mb-6 justify-center items-center"
       onPress={() => goToForm("ngo")}>
        <Text className="text-xl font-semibold text-white text-center">{translation[language].ngo}</Text>

       </TouchableOpacity>
       <TouchableOpacity
       className="bg-blue rounded-2xl w-full py-8 mb-6 justify-center items-center"
       onPress={()=> goToForm("fisherman")}>
       <Text className="text-xl font-semibold text-white text-center">
                 {translation[language].fisherman}
               </Text>
       </TouchableOpacity>

       
             <TouchableOpacity
               onPress={() => goToForm("marine")}
               className="bg-red-500 rounded-2xl w-full py-8 mb-6 justify-center items-center"
             >
               <Text className="text-xl font-semibold text-white text-center">
                 {translation[language].marine}
               </Text>
             </TouchableOpacity>

       </View>
    )
}