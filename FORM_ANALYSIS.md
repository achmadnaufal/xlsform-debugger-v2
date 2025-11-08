# Form Analysis Report: STM RegAg China Garlic

## 1. Form Overview

| Property | Value |
|----------|-------|
| **Form Title** | STM_RegAg_China_Garlic_v0.7 |
| **Form ID** | STM_RegAg_China_Garlic_v0.7 |
| **Version** | 2026021801 |
| **Default Language** | English (en) |
| **Instance Name** | `concat('STM_',${planting_wave},'_',${interviewer},'_',${producer_name},'_',${today})` |
| **Allow Choice Duplicates** | yes |
| **Total Survey Rows** | 745 |
| **Input Questions** | 294 |
| **Languages** | English (en), Chinese (ch) |

### Question Type Distribution

| Type | Count |
|------|-------|
| begin_group | 52 |
| begin_repeat | 5 |
| calculate | 217 |
| date | 7 |
| decimal | 15 |
| end | 1 |
| end_group | 52 |
| end_repeat | 5 |
| file | 2 |
| geopoint | 5 |
| geoshape | 8 |
| hidden | 22 |
| image | 24 |
| integer | 6 |
| note | 98 |
| range | 1 |
| select_multiple | 29 |
| select_one | 114 |
| select_one_from_file | 5 |
| start | 1 |
| start-geopoint | 1 |
| text | 74 |
| today | 1 |

## 2. Question Inventory

| # | Type | Name | Label (EN) | Relevant | Constraint | Required |
|---|------|------|------------|----------|------------|----------|
| 1 | calculate | `registry_type` |  |  |  |  |
| 2 | calculate | `form_status` |  |  |  |  |
| 3 | calculate | `form_location_2` | Location Instance name - settings |  |  |  |
| 4 | note | `note1` | ##<span style="color:#1A5D97">**1. INTRODUCTION**</span> |  |  |  |
| 5 | hidden | `note_test` | ## <span style="color:red">THIS FORM IS A TEST VERSION. DO NOT COLLECT REAL D... | ${form_status}= "standard_dev" |  |  |
| 6 | note | `tip` | Remember: |  |  |  |
| 7 | start | `start` |  |  |  |  |
| 8 | end | `end` |  |  |  |  |
| 9 | today | `today` |  |  |  |  |
| 10 | start-geopoint | `start-geopoint` |  |  |  |  |
| 11 | calculate | `project_id` |  |  |  |  |
| 12 | calculate | `planting_wave` |  |  |  |  |
| 13 | select_one subproject | `subproject_id` | Select a sub project |  |  | True |
| 14 | select_one interviewer | `interviewer` | Name of interviewer |  |  | True |
| 15 | note | `producer_introduction_note` | ##<span style="color:#1A5D97">**2. PRODUCER INTRODUCTION **</span> |  |  |  |
| 16 | note | `` | <span style="color:red">🔔 Request the following information before leaving th... |  |  |  |
| 17 | select_one yes_no | `producer_present_yn` | Is the person interviewed the producer? |  |  | True |
| 18 | note | `representative_info_note` | #### <span style="color:#1A5D97">**Producer representative information**</span> |  |  |  |
| 19 | text | `representative_first_names` | First name of the representative |  |  | True |
| 20 | text | `representative_last_name` | Last name name of the representative |  |  | True |
| 21 | calculate | `representative_name` |  |  |  |  |
| 22 | select_one id_type | `representative_identity_card_type` | Select the ID type of the representative |  |  |  |
| 23 | text | `representative_identity_card_nb` | ID number of the representative | ${representative_identity_card_type} != 'none' |  |  |
| 24 | image | `representative_identity_card_picture` | Take a photo of the representative ID | ${representative_identity_card_type} != 'none' |  |  |
| 25 | text | `representative_phone_number` | Phone number of the representative |  |  |  |
| 26 | select_one relation | `relation_with_producer` | What is his/her relation with the producer? |  |  | True |
| 27 | text | `relation_with_producer_other` | What is his/her relation with the producer? (Other) | ${relation_with_producer} = 'other' |  | True |
| 28 | select_one yes_no | `representative_procuration_yn` | Is there a procuration that entitles the person interviewed to represent the ... |  |  | True |
| 29 | image | `representative_procuration_photo` | Take a picture of the procuration | ${representative_procuration_yn} = 'yes' |  | True |
| 30 | select_one producer_filter | `producer_filter` | Producer filter method |  |  | True |
| 31 | text | `producer_identity_card_nb_select` | Select the producer ID number | ${producer_filter} = 'id' |  | True |
| 32 | select_one location_level_1 | `location_select` | Select the location | ${producer_filter} = 'location' |  | True |
| 33 | select_one producer_organization | `producer_organization_select` | Select the organization/cooperative/association | ${producer_filter} = 'organization' |  | True |
| 34 | select_one subproject | `subproject_id_select` | Select the subproject | ${producer_filter} = 'subprojectid' |  | True |
| 35 | select_one_from_file producer_name.csv | `producer_code_select` | Select the producer |  |  | True |
| 36 | calculate | `prereg_delivery` |  |  |  |  |
| 37 | note | `producer_info_registered_note` | #### <span style="color:#1A5D97">**2. PRODUCER INFORMATION**</span> |  |  |  |
| 38 | calculate | `id_producer_pull` | producer id (data base) |  |  |  |
| 39 | calculate | `producer_code_pull` | producer code (data base) |  |  |  |
| 40 | text | `producer_name_pull` | Producer's name |  |  |  |
| 41 | calculate | `producer_photo_pull` | Producer picture taken (Y/N) |  |  |  |
| 42 | hidden | `producer_photo_pull_note` | Producer picture taken (Y/N) : ${producer_photo_pull} |  |  |  |
| 43 | hidden | `producer_id_type_pull` | ID type |  |  |  |
| 44 | text | `producer_id_pull` | ID number |  |  |  |
| 45 | calculate | `producer_id_photo_pull` | ID picture taken (Y/N) |  |  |  |
| 46 | note | `producer_id_photo_pull_note` | ID picture taken (Y/N) : ${producer_id_photo_pull} |  |  |  |
| 47 | hidden | `producer_phone_number_pull` | Phone number |  |  |  |
| 48 | hidden | `producer_phone_number_other_pull` | Phone number (other) |  |  |  |
| 49 | hidden | `producer_email_pull` | Email address |  |  |  |
| 50 | hidden | `producer_gender_pull` | Gender |  |  |  |
| 51 | text | `producer_birth_date_pull` | Birth date |  |  |  |
| 52 | hidden | `producer_age_pull` | Producer age |  |  |  |
| 53 | text | `local_area_unit_pull` | Local area unit |  |  |  |
| 54 | calculate | `total_area_land_owned_pull` |  |  |  |  |
| 55 | note | `total_area_land_owned_pull_note` | Total area land owned: ${total_area_land_owned_pull} ${local_area_unit_pull} |  |  |  |
| 56 | text | `producer_organization_pull` | Producer organization |  |  |  |
| 57 | text | `producer_interventions_pull` | Available interventions in this producer |  |  |  |
| 58 | calculate | `nb_parcels_registered_pull` | 🗒️ Total number of parcels preregistered: |  |  |  |
| 59 | calculate | `nb_parcels_planted_pull` | 🗒️ Total number of parcels planted/monitored: |  |  |  |
| 60 | calculate | `nb_trees_delivered_pull` | 🚚 Total number of trees delivered: |  |  |  |
| 61 | calculate | `nb_trees_planted_pull` | 🌳 Total number of trees planted: |  |  |  |
| 62 | calculate | `producer_planted_rate_pull` | 🗒️ Overall producer planted rate: |  |  |  |
| 63 | calculate | `producer_nb_parcel_sample_pull` | 🗒️ Number of parcel sampling (mandatory): |  |  |  |
| 64 | note | `nb_parcels_registred_pull_note` | 🗒️ Total number of parcels preregistered: |  |  |  |
| 65 | note | `nb_parcels_planted_pull_note` | 🗒️ Total number of parcels to be monitored: |  |  |  |
| 66 | hidden | `nb_trees_delivered_pull_note` | 🚚 Total number of trees delivered: |  |  |  |
| 67 | hidden | `nb_trees_planted_pull_note` | 🌳 Total number of trees planted: |  |  |  |
| 68 | hidden | `producer_survival_rate_note` | 🗒️ Overall producer planted rate |  |  |  |
| 69 | note | `producer_nb_parcel_sample` | 🗒️ Number of parcel sampling (mandatory): |  |  |  |
| 70 | select_one yes_no | `info_to_correct_yn` | Do you need to correct any of the producer's information? |  |  | True |
| 71 | select_multiple data_correction | `info_to_correct` | Please choose the information that need to be corrected | ${info_to_correct_yn} = 'yes' | not(selected(.,'change_owner') and count-selected(.)>1) | True |
| 72 | note | `prereg_corrected_information_note` | <span style="color:#1A5D97">**Correct the producer data**</span> | ${info_to_correct} != '' |  |  |
| 73 | text | `producer_first_name_corrected` | Correct the information - Producer's first name | selected(${info_to_correct},'producer_name_corrected') |  | True |
| 74 | text | `producer_last_name_corrected` | Correct the information - Producer's last name | selected(${info_to_correct},'producer_name_corrected') |  | True |
| 75 | calculate | `producer_name_corrected` | Correct the information - Producer's name | selected(${info_to_correct},'producer_name_corrected') |  | True |
| 76 | select_one id_type | `producer_identity_card_type_corrected` | Correct the information - Select the ID type | selected(${info_to_correct},' producer_identity_card_type... |  | True |
| 77 | text | `producer_identity_card_nb_corrected` | Correct the information - ID number | selected(${info_to_correct},' producer_identity_card_nb_c... |  | True |
| 78 | image | `producer_identity_card_picture_corrected` | Correct the information - Take a picture of the producer's ID document (front) | selected(${info_to_correct},' producer_identity_card_pict... |  | True |
| 79 | image | `producer_id_photo_back_corrected` | Correct the information - Take a picture of the producer's ID document (back) | selected(${info_to_correct},' producer_identity_card_pict... |  |  |
| 80 | text | `producer_phone_number_corrected` | Correct the information - Phone number | selected(${info_to_correct},' producer_phone_number_corre... |  | True |
| 81 | text | `producer_phone_number_other_corrected` | Correct the information - Phone number (other) | selected(${info_to_correct},' producer_phone_number_corre... |  |  |
| 82 | text | `producer_email_corrected` | Correct the information - Email address | selected(${info_to_correct},' producer_email_corrected') | regex(., '\S+@\S+\.\S+') | True |
| 83 | select_one producer_gender | `producer_gender_corrected` | Correct the information - Gender | selected(${info_to_correct},' producer_gender_corrected') |  | True |
| 84 | date | `producer_birth_date_corrected` | Correct the information - Birth date | selected(${info_to_correct},' producer_birth_date_correct... | .<=today() | True |
| 85 | integer | `producer_age_corrected` | Correct the information - Age | selected(${info_to_correct},' producer_age_corrected') | .>=15 and .<=99 | True |
| 86 | select_one producer_organization | `producer_organization_corrected` | Correct the information - Producer organization/cooperative/association | selected(${info_to_correct},' producer_organization_corre... |  | True |
| 87 | image | `producer_picture_corrected` | Correct the information - Producer picture | selected(${info_to_correct},' producer_picture_corrected') |  | True |
| 88 | select_one area_unit | `local_area_unit_corrected` | Correct the information - Local area unit | selected(${info_to_correct},' local_area_unit_corrected') |  | True |
| 89 | decimal | `total_area_land_owned_corrected` | Correct the information - Total area of land owned / cultivated: (${local_are... | selected(${info_to_correct},' total_area_land_owned_corre... |  | True |
| 90 | text | `producer_mb_id_corrected` | Correct the information - Producer supply chain ID | selected(${info_to_correct},' producer_mb_id_corrected') |  | True |
| 91 | select_one location_level_1 | `location_level_1_corrected` | Correct the information - Location Level 1 | selected(${info_to_correct},' producer_location_corrected') |  | True |
| 92 | select_one location_level_2 | `location_level_2_corrected` | Correct the information - Location Level 2 | selected(${info_to_correct},' producer_location_corrected') |  | True |
| 93 | select_one location_level_3 | `location_level_3_corrected` | Correct the information - Location Level 3 | selected(${info_to_correct},' producer_location_corrected') |  | True |
| 94 | text | `location_level_4_corrected` | Correct the information - Location Level 4 | selected(${info_to_correct},' producer_location_corrected') |  | True |
| 95 | calculate | `producer_consent_yn` |  |  |  |  |
| 96 | note | `note_consent_1` | <span style="color:#1A5D97">**CONSENT FORM – PERSONAL DATA**</span>

The Pure... | ${producer_present_yn} = 'yes' |  |  |
| 97 | note | `note_consent_representative` | <span style="color:#1A5D97">**CONSENT FORM – PERSONAL DATA**</span>

The Pure... | ${producer_present_yn} = 'no' |  |  |
| 98 | select_one gdpr | `producer_consent_personal` | I expressly accept the terms of this Consent Form. |  |  | True |
| 99 | note | `producer_information_new_note` | #### <span style="color:#1A5D97">**2. producer INFORMATION**</span> |  |  |  |
| 100 | select_multiple join_reason | `producer_new_reasons` | Why the producer join the project at this stage ? |  |  |  |
| 101 | select_one producer_type | `producer_type_new` | Is the producer an individual person or an association? |  |  | True |
| 102 | text | `producer_association_name_new` | Association / Community group name | ${producer_type_new}='association' |  | True |
| 103 | select_one id_type | `producer_association_identification_type_new` | Select the association ID type | ${producer_type_new}='association' |  | True |
| 104 | text | `producer_association_identification_nb_new` | Association ID number | ${producer_type_new}='association' and ${producer_associa... |  | True |
| 105 | note | `producer_association_information_note` | ##<span style="color:red">**For associations or companies, fill out the follo... | ${producer_type_new}='association' |  |  |
| 106 | text | `producer_first_names_new` | producer first name |  |  | True |
| 107 | text | `producer_last_name_new` | producer last name |  |  | True |
| 108 | calculate | `producer_name_new` |  |  |  |  |
| 109 | select_one id_type | `producer_identity_card_type_new` | Select the ID type |  |  | True |
| 110 | text | `producer_identity_card_nb_new` | ID number | ${producer_identity_card_type_new} != 'none' |  | True |
| 111 | image | `producer_identity_card_picture_new` | Picture of the producer's ID document (front) | ${producer_identity_card_type_new} != 'none' |  |  |
| 112 | image | `producer_identity_card_picture_back_new` | Picture of the producer's ID document (back) | ${producer_identity_card_type_new} != 'none' |  |  |
| 113 | select_one producer_gender | `producer_gender_new` | Gender |  |  | True |
| 114 | date | `producer_birth_date_new` | Birth date |  | .<=today() |  |
| 115 | note | `producer_age_note_new` | producer age |  |  |  |
| 116 | text | `producer_phone_number_new` | Phone number |  |  | True |
| 117 | text | `producer_phone_number_other_new` | Phone number (other) |  |  |  |
| 118 | text | `producer_email_new` | Email address |  | regex(., '\S+@\S+\.\S+') |  |
| 119 | image | `producer_picture_new` | producer picture |  |  | True |
| 120 | note | `producer_information_new_anonymized_note` | <span style="color:red">⚠️ **No procuration presented by the person interview... |  |  |  |
| 121 | calculate | `producer_first_names_anonymized` |  |  |  |  |
| 122 | calculate | `producer_last_name_anonymized` |  |  |  |  |
| 123 | calculate | `producer_name_anonymized` |  |  |  |  |
| 124 | calculate | `producer_identity_card_type_anonymized` |  |  |  |  |
| 125 | calculate | `producer_identity_card_nb_anonymized` |  |  |  |  |
| 126 | calculate | `producer_gender_anonymized` |  |  |  |  |
| 127 | calculate | `producer_birth_date_anonymized` |  |  |  |  |
| 128 | text | `producer_phone_number_anonymized` | Phone number |  |  | True |
| 129 | text | `producer_phone_number_other_anonymized` | Phone number (other) |  |  |  |
| 130 | text | `producer_email_anonymized` | Email address |  | regex(., '\S+@\S+\.\S+') |  |
| 131 | image | `producer_picture_anonymized` | producer picture |  |  |  |
| 132 | select_one producer_organization | `producer_organization_new` | What organisation is the producer part of? |  | not( (selected(.,'none') or selected(.,'unkown') ) and co... | True |
| 133 | text | `producer_organization_other_new` | What organisation is the producer part of? (Other) | ${producer_organization_new}='other' |  | True |
| 134 | select_one yes_no_idk | `producer_organization_sell_others_new` | Does the producer sell to other organizations / cooperatives / traders? |  | not( (selected(.,'none') or selected(.,'unkown') ) and co... |  |
| 135 | text | `producer_organization_sell_others_comments_new` | Explain which organizations / cooperatives / traders | ${producer_organization_sell_others_new}='yes' |  |  |
| 136 | select_one yes_no_idk | `producer_revelevant_organization_structure_new` | Is the producer part of other relevant organisational structures? |  |  |  |
| 137 | text | `producer_revelevant_organization_structure_comments_new` | Explain which organisational structures | ${producer_revelevant_organization_structure_new} = 'yes' |  |  |
| 138 | select_one area_unit | `local_area_unit_new` | Choose the appropriate area unit |  |  | True |
| 139 | decimal | `total_area_land_owned_new` | Total area of land owned (${local_area_unit_new}) |  | .>=0 | True |
| 140 | select_multiple intervention | `producer_interventions_new` | Select interventions available for this producer |  |  | True |
| 141 | select_multiple activities | `producer_participation_activities` | Did the producer participate in the following mandatory project activities? |  | not(selected(.,'none') and count-selected(.)>1 ) | True |
| 142 | calculate | `producer_relevant_hint` |  |  |  |  |
| 143 | select_one yes_no | `producer_relevant_yn` | Is the producer eligible? |  |  | True |
| 144 | text | `producer_not_relevant_comments` | producer not eligible (comments) : | ${producer_relevant_yn} = 'no' |  |  |
| 145 | calculate | `local_area_unit` |  |  |  |  |
| 146 | calculate | `local_area_unit_conv` |  |  |  |  |
| 147 | calculate | `total_area_land_owned` |  |  |  |  |
| 148 | calculate | `random_producer_number` |  |  |  |  |
| 149 | calculate | `producer_name` |  |  |  |  |
| 150 | calculate | `producer_code_other_producer` |  |  |  |  |
| 151 | calculate | `producer_code` |  |  |  |  |
| 152 | calculate | `producer_organization` |  |  |  |  |
| 153 | calculate | `producer_interventions` |  |  |  |  |
| 154 | select_one confirmation_statement | `stm_confirmation` | Do you want to conduct STM for this producer? |  |  | yes |
| 155 | calculate | `sum_farm_prereg_yn_count` |  |  |  |  |
| 156 | calculate | `out_farm_prereg_yn_count` |  |  |  |  |
| 157 | calculate | `nb_farms_total` |  |  |  |  |
| 158 | calculate | `registered_farms` |  | selected(${stm_confirmation},'yes') or selected(${stm_con... |  |  |
| 159 | calculate | `farm_producer_name` |  |  |  |  |
| 160 | calculate | `farm_producer_code` |  |  |  |  |
| 161 | calculate | `farm_nb` |  |  |  |  |
| 162 | calculate | `nb_farm` | Farm elegible y/n count |  |  |  |
| 163 | calculate | `farm_prereg_yn` |  |  |  |  |
| 164 | calculate | `farm_prereg_yn_count` |  |  |  |  |
| 165 | calculate | `farm_nb_other` |  |  |  |  |
| 166 | note | `farm_info_note` | ##<span style="color:#1A5D97">**3. FARM INFORMATION**</span> |  |  |  |
| 167 | select_one_from_file farm.csv | `farm_id_select` | Select the farm you are at |  |  | yes |
| 168 | calculate | `farm_code_new` |  |  |  |  |
| 169 | calculate | `farm_code_prereg` |  | ${farm_id_select}!='other' |  |  |
| 170 | text | `farm_code` | Farm code: |  |  | yes |
| 171 | calculate | `farm_label_nb` |  |  |  |  |
| 172 | calculate | `farm_label` |  |  |  |  |
| 173 | calculate | `farm_name_pull` |  | ${farm_id_select}!='other' |  |  |
| 174 | calculate | `farm_membership_id_pull` |  | ${farm_id_select}!='other' |  |  |
| 175 | note | `farm_name_pull_note` | Name of the farm: ${farm_name_pull} | ${farm_id_select}!='other' |  |  |
| 176 | hidden | `farm_main_commodity_pull_note` | Main commodity of the farm: | ${farm_id_select}!='other' |  |  |
| 177 | hidden | `farm_membership_id_pull_note` | Membership ID of the farm: ${farm_membership_id_pull} | ${farm_id_select}!='other' |  |  |
| 178 | select_one yes_no | `farm_info_correction_yn` | Do you need to correct any farm information? | ${farm_id_select}!='other' |  | yes |
| 179 | select_multiple farm_info_corrected | `farm_info_to_correct` | Select the variables that need to be corrected | ${farm_info_correction_yn}='yes' |  | yes |
| 180 | note | `farm_info_corrected_note` | ##<span style="color:#4b89bf">**Farm Information Correction**</span> |  |  |  |
| 181 | text | `farm_name_corrected` | Name of the farm corrected | selected(${farm_info_to_correct},'farm_name_corrected') |  |  |
| 182 | select_one detailed_agricultural_land_cover | `farm_main_commodity_corrected` | Main commodity of the farm corrected | selected(${farm_info_to_correct},'farm_main_commodity_cor... |  |  |
| 183 | text | `farm_membership_id_corrected` | Membership ID of the farm corrected | selected(${farm_info_to_correct},'farm_membership_id_corr... |  |  |
| 184 | select_one location_level_1 | `farm_location_level_1` | Farm location - Level 1 |  |  | True |
| 185 | select_one location_level_2 | `farm_location_level_2` | Farm location - Level 2 |  |  | True |
| 186 | select_one location_level_3 | `farm_location_level_3` | Farm location - Level 3 |  |  | True |
| 187 | text | `farm_address` | Farm address |  | string-length(.)<75 |  |
| 188 | select_one yes_no | `farm_legal_type` | Is the farm registered as a company? |  |  | True |
| 189 | text | `farm_legal_name` | Legal name of the company | ${farm_legal_type}='yes' |  | True |
| 190 | select_one id_type | `farm_identification_type` | Select ID type | ${farm_legal_type}='yes' |  | True |
| 191 | text | `farm_identification_nb` | Farm legal ID number | ${farm_legal_type}='yes' |  | True |
| 192 | text | `farm_identification_nb_other` | PAC Number |  |  |  |
| 193 | select_one detailed_agricultural_land_cover | `farm_main_crop` | What is the main commodity of the farm? |  |  | True |
| 194 | text | `farm_main_crop_other` | What is the main commodity of the farm? (other) | ${farm_main_crop} = 'other' |  | True |
| 195 | decimal | `total_area_main_crop` | Total area used for the main commodity (${local_area_unit}) |  | .<=${total_area_land_owned} and .>=0 |  |
| 196 | select_multiple detailed_agricultural_land_cover | `farm_other_crop` | What are other commodities produced on the farm? |  | count-selected(.)<=5 and not(selected(.,'none') and count... | True |
| 197 | note | `farm_other_crop_note` | <span style="color:red">**Warning : You cannot select "None" and something el... | (selected(${farm_other_crop},'none') and count-selected($... |  |  |
| 198 | calculate | `farm_other_crop_1` | 1 |  |  |  |
| 199 | calculate | `farm_other_crop_label_1` | 1 |  |  |  |
| 200 | decimal | `farm_other_crop_area_1` | Total area dedicate to ${farm_other_crop_label_1} (${local_area_unit}) | count-selected(${farm_other_crop})>=1 and not( selected($... | .<=${total_area_land_owned} and .>=0 |  |
| 201 | calculate | `farm_other_crop_2` | 2 |  |  |  |
| 202 | calculate | `farm_other_crop_label_2` | 2 |  |  |  |
| 203 | decimal | `farm_other_crop_area_2` | Total area dedicate to ${farm_other_crop_label_2} (${local_area_unit}) | count-selected(${farm_other_crop})>=2 and not( selected($... | .<=${total_area_land_owned} and .>=0 |  |
| 204 | calculate | `farm_other_crop_3` | 3 |  |  |  |
| 205 | calculate | `farm_other_crop_label_3` | 3 |  |  |  |
| 206 | decimal | `farm_other_crop_area_3` | Total area dedicate to ${farm_other_crop_label_3} (${local_area_unit}) | count-selected(${farm_other_crop})>=3 and not( selected($... | .<=${total_area_land_owned} and .>=0 |  |
| 207 | calculate | `farm_other_crop_4` | 4 |  |  |  |
| 208 | calculate | `farm_other_crop_label_4` | 4 |  |  |  |
| 209 | decimal | `farm_other_crop_area_4` | Total area dedicate to ${farm_other_crop_label_4} (${local_area_unit}) | count-selected(${farm_other_crop})>=4 and not( selected($... | .<=${total_area_land_owned} and .>=0 |  |
| 210 | calculate | `farm_other_crop_5` | 5 |  |  |  |
| 211 | calculate | `farm_other_crop_label_5` | 5 |  |  |  |
| 212 | decimal | `farm_other_crop_area_5` | Total area dedicate to ${farm_other_crop_label_5} (${local_area_unit}) | count-selected(${farm_other_crop})>=5 and not( selected($... | .<=${total_area_land_owned} and .>=0 |  |
| 213 | calculate | `farm_other_crop_total` |  |  |  |  |
| 214 | note | `farm_other_crop_total_note` | <span style="color:red">⚠️ **Warning: the total area dedicated to other commo... | ${farm_other_crop_total} > ${total_area_land_owned} |  |  |
| 215 | select_one yes_no | `producer_supply_chain_program_yn` | Is this farm part of any supply chain sustainability program? |  |  | True |
| 216 | note | `farm_supply_chain_information_note` | #### <span style="color:#1A5D97">**Supply chain program information**</span> |  |  |  |
| 217 | calculate | `supply_chain_mb_file_yn` | Is there a preloaded list of members available? |  |  |  |
| 218 | select_one_from_file supply_chain_member.csv | `supply_chain_mb_select` | Select the person registered in the program | ${supply_chain_mb_file_yn}='yes' |  | True |
| 219 | calculate | `supply_chain_mb_name_pull` | Member name - Pull |  |  |  |
| 220 | calculate | `supply_chain_mb_cluster_pull` | Member Cluster / Segment / Group / Location - Pull |  |  |  |
| 221 | calculate | `supply_chain_mb_subcluster_pull` | Member Sub-Cluster / Segment / Group / Location - Pull |  |  |  |
| 222 | calculate | `supply_chain_mb_category_pull` | Member category - Pull |  |  |  |
| 223 | calculate | `supply_chain_mb_id_pull` | Membership ID number - Pull |  |  |  |
| 224 | calculate | `supply_chain_mb_photo_pull` | Picture of the membership card - Pull |  |  |  |
| 225 | calculate | `supply_chain_relation_with_producer_pull` | What is the producer relation with the person registered? - Pull |  |  |  |
| 226 | calculate | `supply_chain_relation_with_producer_other_pull` | What is the producer relation with the person registered? (other) - Pull |  |  |  |
| 227 | select_one yes_no | `supply_chain_mb_name_yn` | Is the producer the person directly registered in the program? |  |  | True |
| 228 | text | `supply_chain_mb_name_other` | Name of the person registered in the program | ${supply_chain_mb_file_yn} != 'yes' |  | True |
| 229 | calculate | `supply_chain_mb_name` | Name of the person registered in the program |  |  | True |
| 230 | select_one relation | `supply_chain_relation_with_producer` | What is the producer relation with the person registered? | ${supply_chain_mb_name_yn}='no' |  | True |
| 231 | text | `supply_chain_relation_with_producer_other` | What is the producer relation with the person registered? (other) | ${supply_chain_relation_with_producer}='other' |  | True |
| 232 | select_one supply_chain_cluster | `supply_chain_mb_cluster_mb_file_pull` | Member Cluster / Segment / Group / Location | ${supply_chain_mb_file_yn}='yes' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 233 | select_one supply_chain_subcluster | `supply_chain_mb_subcluster_mb_file_pull` | Member Subcluster / Subgment / Subgroup / Location | ${supply_chain_mb_file_yn}='yes' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 234 | select_multiple supply_chain_program | `supply_chain_mb_category_mb_file_pull` | Member category in the program | ${supply_chain_mb_file_yn}='yes' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 235 | text | `supply_chain_mb_id_mb_file_pull` | Membership ID number | ${supply_chain_mb_file_yn}='yes' |  | True |
| 236 | select_one supply_chain_cluster | `supply_chain_mb_cluster_farm_pull` | Member Cluster / Segment / Group / Location | ${supply_chain_mb_file_yn}='no' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 237 | select_one supply_chain_subcluster | `supply_chain_mb_subcluster_farm_pull` | Member Subcluster / Subgment / Subgroup / Location | ${supply_chain_mb_file_yn}='no' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 238 | select_multiple supply_chain_program | `supply_chain_mb_category_farm_pull` | Member category in the program | ${supply_chain_mb_file_yn}='no' | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 239 | text | `supply_chain_mb_id_farm_pull` | Membership ID number | ${supply_chain_mb_file_yn}='no' |  | True |
| 240 | calculate | `supply_chain_mb_cluster` | Member Cluster / Segment / Group / Location |  |  |  |
| 241 | calculate | `supply_chain_mb_subcluster` | Member Subcluster / Subgment / Subgroup / Location |  |  |  |
| 242 | calculate | `supply_chain_mb_category` | Member category in the program |  |  |  |
| 243 | calculate | `supply_chain_mb_id` | Membership ID number |  |  |  |
| 244 | select_one yes_no | `supply_chain_mb_photo_yn_note` | Picture of the membership already card taken? |  |  |  |
| 245 | image | `supply_chain_mb_photo` | Take a picture of the membership card | ${supply_chain_mb_photo_pull}='' |  |  |
| 246 | calculate | `farm_certification_pull` | Is there any certification on the farm? |  |  |  |
| 247 | select_multiple certifications | `farm_certification` | Is there any certification on the farm? |  | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 248 | calculate | `farm_relevant_hint` |  |  |  |  |
| 249 | select_one yes_no | `farm_relevant_yn` | Is the farm eligible? |  |  | True |
| 250 | text | `an` | Farm not eligible (comments) : | ${farm_relevant_yn} = 'no' |  |  |
| 251 | calculate | `sum_parcel_prereg_yn_count` |  |  |  |  |
| 252 | calculate | `out_parcel_prereg_yn_count` |  |  |  |  |
| 253 | calculate | `nb_parcels_total` |  |  |  |  |
| 254 | calculate | `registered_parcels` |  |  |  |  |
| 255 | calculate | `parcel_producer_name` |  |  |  |  |
| 256 | calculate | `parcel_producer_code` |  |  |  |  |
| 257 | calculate | `parcel_farm_name` |  |  |  |  |
| 258 | calculate | `parcel_farm_code` |  |  |  |  |
| 259 | calculate | `parcel_nb` |  |  |  |  |
| 260 | calculate | `nb_parcel` | Count relevant parcels |  |  |  |
| 261 | calculate | `parcel_nb_other` |  |  |  |  |
| 262 | note | `short_term_monitoring_note` | ##<span style="color:#1A5D97">**Short Term Monitoring**</span> |  |  |  |
| 263 | note | `parcel_selection_note` | #<span style="color:#1A5D97">**Parcel Selection**</span> |  |  |  |
| 264 | select_one_from_file geometry.csv | `parcel_checking_stm` | Please, Check the information of the parcel you're at. | false() |  |  |
| 265 | select_one_from_file parcel.csv | `parcel_id_select` | Select the parcel you are at |  |  |  |
| 266 | calculate | `parcel_code_prereg` |  | ${parcel_id_select}!='other' |  |  |
| 267 | calculate | `parcel_prereg_yn` | parcel_prereg_yn |  |  | yes |
| 268 | calculate | `parcel_prereg_yn_count` | parcel_prereg_yn_count |  |  |  |
| 269 | calculate | `parcel_code_new` | parcel_code_new |  |  |  |
| 270 | text | `parcel_code` | Parcel code |  |  | yes |
| 271 | text | `parcel_interventions_pull` | Intervention type available in this parcel: | ${parcel_id_select}!='other' |  |  |
| 272 | select_multiple intervention | `parcel_interventions_new` | Available intervention for this parcel | ${parcel_id_select}='other' |  | True |
| 273 | calculate | `parcel_interventions` |  |  |  |  |
| 274 | select_one yes_no | `minimim_trees_reminder` | Remember, the minimum number of trees to create a new parcel is [X] trees. Do... | ${parcel_id_select}='other' and ${parcel_interventions}='... | .='yes' | yes |
| 275 | calculate | `parcel_sampling_yn_pull` | parcel_sampling_yn_pull |  |  | yes |
| 276 | note | `parcel_sampling_yn` | Sampling Parcel : |  |  |  |
| 277 | calculate | `planted_trees_hint_yn_pull` | parcel_sampling_yn_pull |  |  | yes |
| 278 | note | `planted_trees_hint_yn` | Show hints of planted trees: | ${parcel_interventions}='agroforestry' |  |  |
| 279 | calculate | `parcel_label_nb` |  |  |  |  |
| 280 | calculate | `parcel_label` |  |  |  |  |
| 281 | note | `planting_dates_note` | #<span style="color:#1A5D97">**Short Term Monitoring dates info**</span> |  |  |  |
| 282 | date | `short_term_monitoring_date` | Short Term Monitoring date |  |  | yes |
| 283 | date | `planted_date_pull_registry` | Date of planting registry for this producer | ${parcel_interventions} = 'agroforestry' |  |  |
| 284 | integer | `planted_trees_reminder_registry` | 🌳Total number of trees planted to this producer | ${parcel_interventions} = 'agroforestry' |  |  |
| 285 | calculate | `species_1_nb_planted_trees_registry` |  |  |  |  |
| 286 | note | `species_1_nb_planted_trees_note_registry` | Species 1 Total number of trees planted: <span style="color:red">${species_1_... | ${species_1_nb_planted_trees_registry} > 0 |  |  |
| 287 | calculate | `species_2_nb_planted_trees_registry` |  |  |  |  |
| 288 | note | `species_2_nb_planted_trees_note_registry` | Species 2 Total number of trees planted: <span style="color:red">${species_2_... | ${species_2_nb_planted_trees_registry} > 0 |  |  |
| 289 | calculate | `species_3_nb_planted_trees_registry` |  |  |  |  |
| 290 | note | `species_3_nb_planted_trees_note_registry` | Species 3 Total number of trees planted: <span style="color:red">${species_3_... | ${species_3_nb_planted_trees_registry} > 0 |  |  |
| 291 | calculate | `species_4_nb_planted_trees_registry` |  |  |  |  |
| 292 | note | `species_4_nb_planted_trees_note_registry` | Species 4 Total number of trees planted: <span style="color:red">${species_4_... | ${species_4_nb_planted_trees_registry} > 0 |  |  |
| 293 | calculate | `species_5_nb_planted_trees_registry` |  |  |  |  |
| 294 | note | `species_5_nb_planted_trees_note_registry` | Species 5 Total number of trees planted: <span style="color:red">${species_5_... | ${species_5_nb_planted_trees_registry} > 0 |  |  |
| 295 | geopoint | `geopoint_parcel` | Record GPS point | ${parcel_interventions}  = 'agroforestry' |  | True |
| 296 | note | `parcel_location_note` | #### <span style="color:#1A5D97">**Parcel location**</span> |  |  |  |
| 297 | hidden | `parcel_location_level_4` | Parcel location - Level 4 |  |  | True |
| 298 | hidden | `parcel_location_level_5` | Parcel location - Level 5 |  | string-length(.)<100 |  |
| 299 | text | `parcel_name` | Parcel name / identification |  | string-length(.)<25 |  |
| 300 | hidden | `altitude_geopoint_parcel` | Altitude (m) | ${parcel_interventions}  = 'agroforestry' |  |  |
| 301 | image | `picture_parcel` | Picture of the parcel |  |  |  |
| 302 | note | `parcel_land_use_note` | #### <span style="color:#1A5D97">**Parcel land use**</span> |  |  |  |
| 303 | select_one deforested_yn | `parcel_parcel_deforested_yn` | Was the parcel deforested less than 10 years ago? | ${parcel_interventions_new}  = 'agroforestry' |  |  |
| 304 | select_one land_cover_category | `current_land_use` | Land cover category |  |  |  |
| 305 | select_multiple land_cover | `detailed_land_use` | Land cover |  | count-selected(.)<=3 |  |
| 306 | calculate | `fallows_years_min` |  |  |  |  |
| 307 | integer | `nb_years_land_considered_fallows` | For how many years this land as been considered as a fallows? | selected(${detailed_land_use}, 'fallows') or selected(${d... |  |  |
| 308 | note | `nb_years_land_considered_fallows_warning` | <span style="color:red">⚠️ **Warning: If the land has been a fallow for more ... | ( selected(${detailed_land_use}, 'fallows') ) and  ${nb_y... | ${nb_years_land_considered_fallows} > 10 |  |
| 309 | select_one land_status | `current_land_status` | Current land status |  |  |  |
| 310 | select_one detailed_agricultural_land_cover | `detailed_agricultural_land_cover` | Detailed agricultural land cover | selected(${detailed_land_use}, 'specific_annual_rotation'... | not(selected(.,'none') and count-selected(.)>1 ) |  |
| 311 | text | `detailed_agricultural_land_cover_other` | Detailed agricultural land cover (other) | selected(${detailed_agricultural_land_cover}, 'other') |  |  |
| 312 | select_one crop_cycle | `crop_cycle` | Crop cycle | ( ${current_land_use} = 'permanent_crops' or ${current_la... |  |  |
| 313 | note | `agro_ecological_characteristics_note` | #### <span style="color:#1A5D97">**Parcel agro-ecological characteristics**</... |  |  |  |
| 314 | range | `slope_percentage` | Slope percentage (Approximatively) (%) |  | .>=0 and .<=100 |  |
| 315 | select_one soil_texture | `soil_texture` | Soil texture (Observation) |  |  |  |
| 316 | select_one erosion | `erosion_level` | Erosion level |  |  |  |
| 317 | select_one soil_stoniness | `soil_stoniness` | Indicate the soil stoniness |  |  |  |
| 318 | select_one soil_depth | `soil_depth_level` | Indicate the soil depth level |  |  |  |
| 319 | decimal | `soil_ph` | Indicate the soil pH |  |  |  |
| 320 | select_one yes_no | `water_system_irrigation` | Is there a water system to provide irrigation to the crop? |  |  |  |
| 321 | select_one yes_no | `crops_adapted_annual_rainfall` | Is the main crop adapted to the annual rainfall? | ${water_system_irrigation} = 'no' |  |  |
| 322 | select_one yes_no | `parcel_risk_water_yn` | Is there any water related risk on this parcel? |  |  |  |
| 323 | select_one water_risk | `parcel_risk_water` | Water risk present on parcel | ${parcel_risk_water_yn} = 'yes' |  |  |
| 324 | select_one yes_no | `parcel_risk_infrastructure_yn` | Is there any risk related to infrastructure present on thisparcel? |  |  |  |
| 325 | select_multiple infrastructure_risk | `parcel_risk_infrastructure` | Infrastructure risk present on parcel | ${parcel_risk_infrastructure_yn} = 'yes' |  |  |
| 326 | text | `comment_parcel_suitability` | Comments on parcel suitability |  |  |  |
| 327 | select_multiple species_on_parcel | `species_already_on_parcel` | Which species are already present on the parcel? |  |  |  |
| 328 | text | `species_already_on_parcel_other` | Which species are already present on the parcel? (other) | selected(${species_already_on_parcel}, 'other') |  |  |
| 329 | note | `land_tenure_parcel_note` | #### <span style="color:#1A5D97">**Parcel land tenure**</span> |  |  |  |
| 330 | select_one yes_no | `repeat_land_tenure_yn` | Is the land tenure document the same as the previous parcel? | ${parcel_nb} >= 2 |  |  |
| 331 | select_one land_tenure | `legal_document_type` | Land tenure type |  |  |  |
| 332 | select_one land_tenure_name | `legal_document_name` | Select the document name |  |  |  |
| 333 | select_one issue_agency | `legal_document_issue_agency` | Issue agency |  |  |  |
| 334 | select_one yes_no | `legal_document_access_yn` | Do you have access to the legal document? |  |  |  |
| 335 | select_one yes_no | `legal_document_authorization_yn` | The producer authorize to collect a copy of the legal document? | ${legal_document_access_yn} = 'yes' |  |  |
| 336 | select_one yes_no | `legal_document_producer_name_yn` | Is the name registered on the legal document the same as the producer name? | ${legal_document_access_yn} = 'yes' |  |  |
| 337 | text | `legal_document_person_name` | Name of the person on the document | ${legal_document_access_yn} = 'yes' |  |  |
| 338 | select_one relation | `legal_document_relation` | Relationship with the producer | ${legal_document_access_yn} = 'yes' and ${legal_document_... |  |  |
| 339 | date | `legal_document_expiration` | Year of expiration of the document | ${legal_document_access_yn} = 'yes' | .>=today() |  |
| 340 | select_one document_type | `legal_document_collection_method` | Select the method to collect the legal document | ${legal_document_authorization_yn} = 'yes' |  |  |
| 341 | file | `legal_document_pdf` | Upload the PDF | ${legal_document_collection_method}='pdf' |  |  |
| 342 | integer | `legal_document_nb_pages` | How many pages does the legal document contains? |  | .>0 |  |
| 343 | image | `legal_document_picture` | Legal document picture |  |  |  |
| 344 | note | `parcel_elegibility_note` | #### <span style="color:#1A5D97">**Parcel eligibility**</span> |  |  |  |
| 345 | select_one yes_no | `producer_plan_cut_trees_yn` | Is the producer planning to cut trees in this parcel to replace them with tre... | ${parcel_interventions}='agroforestry' |  | True |
| 346 | select_multiple reason_to_cut | `producer_plan_cut_trees_reason` | producer reason to cut the trees | ${producer_plan_cut_trees_yn} = 'yes' |  | True |
| 347 | note | `parcel_ineligible_for_implementation_note` | <span style="color:red">🛑 **Reason selected makes the parcel ineligible for i... | selected(${producer_plan_cut_trees_reason},'preference_fo... |  |  |
| 348 | integer | `parcel_nb_trees_want_to_cut` | How many trees do you plan to cut? | ${producer_plan_cut_trees_yn} = 'yes' |  | True |
| 349 | select_one yes_no | `parcel_relevant_yn` | Is the parcel relevant for monitoring ? |  |  | True |
| 350 | select_multiple not_relevant | `parcel_not_relevant_explanation` | Why is the parcel not elegible for monitoring ? | ${parcel_relevant_yn} = 'no' |  | True |
| 351 | text | `parcel_not_relevant_comments` | Parcel not elegible (comments) : | ${parcel_relevant_yn} = 'no' |  |  |
| 352 | note | `parcel_gps_track_note` | #### <span style="color:#1A5D97">**Parcel GPS track**</span> |  |  |  |
| 353 | select_one parcel_gps_method | `parcel_gps_method` | How do you want to register the area of this parcel |  |  | True |
| 354 | hidden | `parcel_checking` | **Check which parcel your are at** | selected(${parcel_gps_method}, 'take_gps') |  |  |
| 355 | hidden | `parcel_preload_select` | Select the parcel you want to preload | selected(${parcel_gps_method}, 'take_gps') |  | True |
| 356 | calculate | `parcel_preload_geometry_pull` |  |  |  |  |
| 357 | note | `track_note` | Remember | selected(${parcel_gps_method}, 'take_gps') |  |  |
| 358 | geoshape | `geoshape_preload` | Preload the boundaries of this parcel | selected(${parcel_gps_method}, 'preload_gps') |  | True |
| 359 | calculate | `area_preload` |  | selected(${parcel_gps_method}, 'preload_gps') |  |  |
| 360 | note | `area_preload_note` | Parcel area : ${area_preload}  ${local_area_unit} | selected(${parcel_gps_method}, 'preload_gps') |  |  |
| 361 | geoshape | `geoshape_manual` | Record the boundaries of this parcel | selected(${parcel_gps_method}, 'take_gps') |  | True |
| 362 | calculate | `area_manual` |  | selected(${parcel_gps_method}, 'take_gps') |  |  |
| 363 | note | `area_manual_note` | Parcel area : ${area_manual}  ${local_area_unit} | selected(${parcel_gps_method}, 'take_gps') |  |  |
| 364 | calculate | `area_parcel` |  |  |  |  |
| 365 | calculate | `sum_intervention_prereg_yn_count` |  |  |  |  |
| 366 | calculate | `out_intervention_prereg_yn_count` |  |  |  |  |
| 367 | calculate | `nb_interventions_total` |  |  |  |  |
| 368 | calculate | `registered_interventions_filter` | registered_interventions_filter |  |  |  |
| 369 | calculate | `intervention_type_pull` |  |  |  |  |
| 370 | select_one intervention_type | `intervention_type_select` | Select intervention type |  |  | yes |
| 371 | select_one stm_year | `stm_year_select` | Which STM are you conducting? |  |  | yes |
| 372 | select_one yes_no | `intervention_realized_yn` | Has the intervention been realized to some extent? |  |  | yes |
| 373 | calculate | `oa_prereg_input` |  | ${intervention_type_select}='organic_amendment' |  |  |
| 374 | calculate | `oa_prereg_stages` |  | ${intervention_type_select}='organic_amendment' |  |  |
| 375 | calculate | `oa_prereg_dose` |  | ${intervention_type_select}='organic_amendment' |  |  |
| 376 | select_multiple type_input | `oa_input_type_applied` | OA.2: Type of input applied |  |  | yes |
| 377 | select_multiple development_stage | `oa_development_stage` | OA.3: Select development stage(s) |  |  | yes |
| 378 | date | `oa_application_date` | OA.4: Application date |  |  | yes |
| 379 | decimal | `oa_dose_applied` | OA.5: Applied dose (kg/mu) |  |  | yes |
| 380 | image | `oa_delivery_doc` | OA.6: Delivery documentation |  |  |  |
| 381 | image | `oa_field_evidence` | OA.7: Field application evidence |  |  |  |
| 382 | select_multiple stm_issues | `oa_issues` | OA.8: What were the issues experienced? |  |  |  |
| 383 | text | `oa_issues_comment` | OA.9: Comment on issues | not(selected(${oa_issues}, 'none')) and ${oa_issues} != '' |  |  |
| 384 | note | `oa_recap` | OA.10: Intervention Summary

**Input Type:**
Pre-reg: ${oa_prereg_input}
STM:... |  |  |  |
| 385 | select_one yes_no | `oa_validation` | OA.11: Validate intervention implementation? |  |  | yes |
| 386 | select_one yes_no | `oa_same_area_y2` | OA.12: Same area as STM y+1? |  |  | yes |
| 387 | select_one area_scenario | `oa_area_scenario` | OA.13: What happened? | ${oa_same_area_y2}='no' |  | yes |
| 388 | text | `oa_reason_same_area_diff_boundaries` | OA.14a: Reason for different boundaries | ${oa_area_scenario}='same_area_diff_boundaries' |  |  |
| 389 | text | `oa_reason_new_area` | OA.14b: Reason for new area | ${oa_area_scenario}='same_parcel_new_area' |  |  |
| 390 | text | `oa_reason_different_parcel` | OA.14c: Reason for different parcel | ${oa_area_scenario}='different_parcel' |  |  |
| 391 | geoshape | `oa_y2_adjusted_boundary` | Record adjusted GPS boundary |  |  |  |
| 392 | calculate | `oa_y2_adjusted_area_ha` |  |  |  |  |
| 393 | calculate | `oa_y2_adjusted_area_mu` |  |  |  |  |
| 394 | note | `oa_y2_adjusted_area_note` | Adjusted area: ${oa_y2_adjusted_area_ha} ha (${oa_y2_adjusted_area_mu} mu) |  |  |  |
| 395 | text | `oa_y2_new_area_desc` | Describe the new area |  |  |  |
| 396 | decimal | `oa_y2_new_area_size_mu` | Area size (mu) |  | . > 0 and . <= 1000 | yes |
| 397 | geopoint | `oa_y2_new_area_gps` | GPS location of new area |  |  |  |
| 398 | geoshape | `oa_y2_new_area_boundary` | GPS boundary of new area |  |  |  |
| 399 | calculate | `oa_y2_new_area_gps_ha` |  |  |  |  |
| 400 | calculate | `oa_y2_new_area_gps_mu` |  |  |  |  |
| 401 | note | `oa_y2_new_area_summary` | Declared: ${oa_y2_new_area_size_mu} mu \| GPS: ${oa_y2_new_area_gps_mu} mu |  |  |  |
| 402 | note | `oa_y2_prereg_intro` | Register basic information for the new parcel below. |  |  |  |
| 403 | text | `oa_y2_new_parcel_name` | Parcel name / identifier |  |  | yes |
| 404 | select_one location_level_1 | `oa_y2_new_parcel_province` | Province |  |  |  |
| 405 | select_one location_level_2 | `oa_y2_new_parcel_county` | County |  |  |  |
| 406 | select_one location_level_3 | `oa_y2_new_parcel_town` | Town / Township |  |  |  |
| 407 | text | `oa_y2_new_parcel_village` | Village |  |  |  |
| 408 | decimal | `oa_y2_new_parcel_area_mu` | Total parcel area (mu) |  | . > 0 and . <= 1000 | yes |
| 409 | calculate | `oa_y2_new_parcel_area_ha` |  |  |  |  |
| 410 | select_one species_on_parcel | `oa_y2_new_parcel_variety` | Species on parcel |  |  |  |
| 411 | geopoint | `oa_y2_new_parcel_gps` | Parcel GPS location |  |  |  |
| 412 | geoshape | `oa_y2_new_parcel_boundary` | Parcel GPS boundary |  |  |  |
| 413 | calculate | `oa_y2_new_parcel_gps_ha` |  |  |  |  |
| 414 | calculate | `oa_y2_new_parcel_gps_mu` |  |  |  |  |
| 415 | note | `oa_y2_prereg_summary` | **New Parcel Summary**
Name: ${oa_y2_new_parcel_name}
Location: ${oa_y2_new_p... |  |  |  |
| 416 | select_multiple type_input | `oa_y2_input_type_applied` | OA.2 (Y+2): Type of input applied |  |  | yes |
| 417 | select_multiple development_stage | `oa_y2_development_stage` | OA.3 (Y+2): Select development stage(s) |  |  | yes |
| 418 | date | `oa_y2_application_date` | OA.4 (Y+2): Application date |  |  | yes |
| 419 | decimal | `oa_y2_dose_applied` | OA.5 (Y+2): Applied dose (kg/mu) |  |  | yes |
| 420 | image | `oa_y2_delivery_doc` | OA.6 (Y+2): Delivery documentation |  |  |  |
| 421 | image | `oa_y2_field_evidence` | OA.7 (Y+2): Field application evidence |  |  |  |
| 422 | select_multiple stm_issues | `oa_y2_issues` | OA.8 (Y+2): Issues experienced? |  |  |  |
| 423 | text | `oa_y2_issues_comment` | OA.9 (Y+2): Comment | not(selected(${oa_y2_issues}, 'none')) and ${oa_y2_issues... |  |  |
| 424 | note | `oa_y2_recap` | OA.10 (Y+2): Summary - Input: ${oa_y2_input_type_applied}, Stage: ${oa_y2_dev... |  |  |  |
| 425 | select_one yes_no | `oa_y2_validation` | OA.11 (Y+2): Validate? |  |  | yes |
| 426 | calculate | `four_r_prereg_baseline_source` |  | ${intervention_type_select}='4r_fertilizer' |  |  |
| 427 | calculate | `four_r_prereg_baseline_rate` |  | ${intervention_type_select}='4r_fertilizer' |  |  |
| 428 | calculate | `four_r_prereg_baseline_time` |  | ${intervention_type_select}='4r_fertilizer' |  |  |
| 429 | calculate | `four_r_prereg_baseline_place` |  | ${intervention_type_select}='4r_fertilizer' |  |  |
| 430 | select_one yes_no | `four_r_baselined_yn` | 4R.2: Has farmer been baselined for 4R? |  |  | yes |
| 431 | select_one yes_no | `four_r_baseline_now` | 4R.3: Baseline farmer now? | ${four_r_baselined_yn}='no' |  | yes |
| 432 | image | `four_r_baseline_evidence` | 4R.4: Baseline assessment evidence | ${four_r_baseline_now}='yes' |  | yes |
| 433 | select_one 4r_level | `four_r_baseline_source` | Right SOURCE baseline level |  |  | yes |
| 434 | select_one 4r_level | `four_r_baseline_rate` | Right RATE baseline level |  |  | yes |
| 435 | select_one 4r_level | `four_r_baseline_time` | Right TIME baseline level |  |  | yes |
| 436 | select_one 4r_level | `four_r_baseline_place` | Right PLACE baseline level |  |  | yes |
| 437 | select_one 4r_level | `four_r_y1_source` | Right SOURCE y+1 level |  |  | yes |
| 438 | select_one 4r_level | `four_r_y1_rate` | Right RATE y+1 level |  |  | yes |
| 439 | select_one 4r_level | `four_r_y1_time` | Right TIME y+1 level |  |  | yes |
| 440 | select_one 4r_level | `four_r_y1_place` | Right PLACE y+1 level |  |  | yes |
| 441 | image | `four_r_y1_evidence` | 4R.7: Y+1 assessment evidence |  |  | yes |
| 442 | select_multiple stm_issues | `four_r_y1_issues` | 4R.8: Issues experienced? |  |  |  |
| 443 | text | `four_r_y1_issues_comment` | 4R.9: Comment on issues | not(selected(${four_r_y1_issues}, 'none')) and ${four_r_y... |  |  |
| 444 | calculate | `four_r_source_improved` |  |  |  |  |
| 445 | calculate | `four_r_rate_improved` |  |  |  |  |
| 446 | calculate | `four_r_time_improved` |  |  |  |  |
| 447 | calculate | `four_r_place_improved` |  |  |  |  |
| 448 | calculate | `four_r_total_improvements` |  |  |  |  |
| 449 | note | `four_r_y1_recap` | 4R.10: Assessment Summary

**Right SOURCE:** ${four_r_baseline_source} -> ${f... |  |  |  |
| 450 | select_one yes_no | `four_r_y1_validation` | 4R.11: Validate intervention? |  | . = 'no' or ${four_r_total_improvements} >= 2 | yes |
| 451 | select_one yes_no | `four_r_same_area_y2` | 4R.12: Same area as y+1? |  |  | yes |
| 452 | select_one 4r_level | `four_r_y2_source` | 4R.13: Right SOURCE y+2 level |  |  | yes |
| 453 | select_one 4r_level | `four_r_y2_rate` | 4R.13: Right RATE y+2 level |  |  | yes |
| 454 | select_one 4r_level | `four_r_y2_time` | 4R.13: Right TIME y+2 level |  |  | yes |
| 455 | select_one 4r_level | `four_r_y2_place` | 4R.13: Right PLACE y+2 level |  |  | yes |
| 456 | image | `four_r_y2_evidence` | 4R.14: Y+2 evidence |  |  | yes |
| 457 | select_multiple stm_issues | `four_r_y2_issues` | 4R.15: Issues? |  |  |  |
| 458 | text | `four_r_y2_issues_comment` | 4R.16: Comment | not(selected(${four_r_y2_issues}, 'none')) and ${four_r_y... |  |  |
| 459 | calculate | `four_r_source_maintained` |  |  |  |  |
| 460 | calculate | `four_r_rate_maintained` |  |  |  |  |
| 461 | calculate | `four_r_time_maintained` |  |  |  |  |
| 462 | calculate | `four_r_place_maintained` |  |  |  |  |
| 463 | calculate | `four_r_total_maintained` |  |  |  |  |
| 464 | note | `four_r_y2_recap` | 4R.17: Y+1 vs Y+2 Comparison

SOURCE: ${four_r_y1_source} -> ${four_r_y2_sour... |  |  |  |
| 465 | select_one area_scenario | `four_r_area_scenario` | 4R.18: What happened? |  |  | yes |
| 466 | text | `four_r_reason_same_area_diff_boundaries` | 4R.19a: Reason | ${four_r_area_scenario}='same_area_diff_boundaries' |  |  |
| 467 | text | `four_r_reason_new_area` | 4R.19b: Reason | ${four_r_area_scenario}='same_parcel_new_area' |  |  |
| 468 | text | `four_r_reason_different_parcel` | 4R.19c: Reason | ${four_r_area_scenario}='different_parcel' |  |  |
| 469 | geoshape | `four_r_y2_adjusted_boundary` | Record adjusted GPS boundary |  |  |  |
| 470 | calculate | `four_r_y2_adjusted_area_ha` |  |  |  |  |
| 471 | calculate | `four_r_y2_adjusted_area_mu` |  |  |  |  |
| 472 | note | `four_r_y2_adjusted_area_note` | Adjusted area: ${four_r_y2_adjusted_area_ha} ha (${four_r_y2_adjusted_area_mu... |  |  |  |
| 473 | text | `four_r_y2_new_area_desc` | Describe the new area |  |  |  |
| 474 | decimal | `four_r_y2_new_area_size_mu` | Area size (mu) |  | . > 0 and . <= 1000 | yes |
| 475 | geopoint | `four_r_y2_new_area_gps` | GPS location of new area |  |  |  |
| 476 | geoshape | `four_r_y2_new_area_boundary` | GPS boundary of new area |  |  |  |
| 477 | calculate | `four_r_y2_new_area_gps_ha` |  |  |  |  |
| 478 | calculate | `four_r_y2_new_area_gps_mu` |  |  |  |  |
| 479 | note | `four_r_y2_new_area_summary` | Declared: ${four_r_y2_new_area_size_mu} mu \| GPS: ${four_r_y2_new_area_gps_mu... |  |  |  |
| 480 | note | `four_r_y2_prereg_intro` | Register basic information for the new parcel below. |  |  |  |
| 481 | text | `four_r_y2_new_parcel_name` | Parcel name / identifier |  |  | yes |
| 482 | select_one location_level_1 | `four_r_y2_new_parcel_province` | Province |  |  |  |
| 483 | select_one location_level_2 | `four_r_y2_new_parcel_county` | County |  |  |  |
| 484 | select_one location_level_3 | `four_r_y2_new_parcel_town` | Town / Township |  |  |  |
| 485 | text | `four_r_y2_new_parcel_village` | Village |  |  |  |
| 486 | decimal | `four_r_y2_new_parcel_area_mu` | Total parcel area (mu) |  | . > 0 and . <= 1000 | yes |
| 487 | calculate | `four_r_y2_new_parcel_area_ha` |  |  |  |  |
| 488 | select_one species_on_parcel | `four_r_y2_new_parcel_variety` | Species on parcel |  |  |  |
| 489 | geopoint | `four_r_y2_new_parcel_gps` | Parcel GPS location |  |  |  |
| 490 | geoshape | `four_r_y2_new_parcel_boundary` | Parcel GPS boundary |  |  |  |
| 491 | calculate | `four_r_y2_new_parcel_gps_ha` |  |  |  |  |
| 492 | calculate | `four_r_y2_new_parcel_gps_mu` |  |  |  |  |
| 493 | note | `four_r_y2_prereg_summary` | **New Parcel Summary**
Name: ${four_r_y2_new_parcel_name}
Location: ${four_r_... |  |  |  |
| 494 | note | `four_r_diff_area_note` | 🔄 Now assess 4R levels for the different area |  |  |  |
| 495 | select_one 4r_level | `four_r_y2_diff_source` | 4R.13 (diff area): Right SOURCE y+2 level |  |  | yes |
| 496 | select_one 4r_level | `four_r_y2_diff_rate` | 4R.13 (diff area): Right RATE y+2 level |  |  | yes |
| 497 | select_one 4r_level | `four_r_y2_diff_time` | 4R.13 (diff area): Right TIME y+2 level |  |  | yes |
| 498 | select_one 4r_level | `four_r_y2_diff_place` | 4R.13 (diff area): Right PLACE y+2 level |  |  | yes |
| 499 | image | `four_r_y2_diff_evidence` | 4R.14 (diff area): Y+2 evidence |  |  | yes |
| 500 | select_multiple stm_issues | `four_r_y2_diff_issues` | 4R.15 (diff area): Issues? |  |  |  |
| 501 | text | `four_r_y2_diff_issues_comment` | 4R.16 (diff area): Comment | not(selected(${four_r_y2_diff_issues}, 'none')) and ${fou... |  |  |
| 502 | calculate | `four_r_diff_source_maintained` |  |  |  |  |
| 503 | calculate | `four_r_diff_rate_maintained` |  |  |  |  |
| 504 | calculate | `four_r_diff_time_maintained` |  |  |  |  |
| 505 | calculate | `four_r_diff_place_maintained` |  |  |  |  |
| 506 | calculate | `four_r_diff_total_maintained` |  |  |  |  |
| 507 | note | `four_r_y2_diff_recap` | 4R.17 (diff area): Assessment Summary

SOURCE: ${four_r_baseline_source} -> $... |  |  |  |
| 508 | select_one yes_no | `four_r_y2_validation` | 4R.11 (Y+2): Validate? |  | . = 'no' or if(${four_r_same_area_y2}='yes', ${four_r_tot... | yes |
| 509 | note | `not_registered_interventions__note` | # <span style="color:#1A5D97">**Not registered planting models**</span> |  |  |  |
| 510 | calculate | `registered_interventions_from_prereg` |  |  |  |  |
| 511 | calculate | `not_registered_interventions_from_prereg` |  |  |  |  |
| 512 | select_one intervention | `not_registered_interventions_note` | The following are the planting models that have not been registered yet | ${not_registered_interventions_from_prereg}>0 |  |  |
| 513 | select_one yes_no | `finilize_with_missing_planting_models_yes_no` | Do you wish to finilize this parcel's registry, meaning this planting models ... | ${not_registered_interventions_from_prereg}>0 |  |  |
| 514 | select_multiple reasons_not_registered_planting_models | `reasons_not_registered_planting_models` | Why are these planting models not gonna be planted? | ${finilize_with_missing_planting_models_yes_no}='yes' |  |  |
| 515 | note | `continue_registry_note` | # <span style="color:#1A5D97">**Please go back and registry the other plantin... | ${finilize_with_missing_planting_models_yes_no}='no' |  |  |
| 516 | calculate | `parcel_nb_interventions` |  |  |  |  |
| 517 | calculate | `parcel_nb_validated_interventions` |  |  |  |  |
| 518 | calculate | `parcel_nb_not_validated_interventions` |  |  |  |  |
| 519 | calculate | `parcel_nb_validated_count` |  |  |  |  |
| 520 | calculate | `parcel_nb_not_validated_count` |  |  |  |  |
| 521 | note | `parcel_total_nb_interventions_warning` | <span style="color:red">🛑** A elegible parcel must have at least 1 interventi... | (${parcel_relevant_yn}='yes' or ${parcel_id_select} != 'o... |  | True |
| 522 | calculate | `parcel_area_prereg` |  |  |  |  |
| 523 | calculate | `parcel_area_stm` |  |  |  |  |
| 524 | calculate | `validated_parcel_area_stm` |  |  |  |  |
| 525 | calculate | `species_1_nb_of_trees_living_out_parcel` |  |  |  |  |
| 526 | calculate | `species_2_nb_of_trees_living_out_parcel` |  |  |  |  |
| 527 | calculate | `species_3_nb_of_trees_living_out_parcel` |  |  |  |  |
| 528 | calculate | `species_4_nb_of_trees_living_out_parcel` |  |  |  |  |
| 529 | calculate | `species_5_nb_of_trees_living_out_parcel` |  |  |  |  |
| 530 | calculate | `parcel_total_nb_of_trees_living_out` |  |  |  |  |
| 531 | calculate | `species_1_selected` |  |  |  |  |
| 532 | calculate | `species_2_selected` |  |  |  |  |
| 533 | calculate | `species_3_selected` |  |  |  |  |
| 534 | calculate | `species_4_selected` |  |  |  |  |
| 535 | calculate | `species_5_selected` |  |  |  |  |
| 536 | calculate | `nb_species_selected` |  |  |  |  |
| 537 | calculate | `total_immature_trees_out_parcel` |  |  |  |  |
| 538 | calculate | `total_trees_too_tall_out_parcel` |  |  |  |  |
| 539 | calculate | `total_trees_stressed_out_parcel` |  |  |  |  |
| 540 | calculate | `total_trees_unhealthy_out_parcel` |  |  |  |  |
| 541 | note | `note4` | ##<span style="color:#1A5D97">**4. PARCEL RECAPITULATION**</span> |  |  |  |
| 542 | note | `parcel_total_nb_interventions_note` | <span style="color:#099665"> **Total Interventions in this parcel:** </span> ... |  |  |  |
| 543 | note | `parcel_list_interventions_note` | <span style="color:#099665"> ** Interventions in this parcel:** </span>  ${re... |  |  |  |
| 544 | note | `parcel_total_nb_validated_interventention_note` | <span style="color:#099665"> ** Validated Interventions in this parcel:** </s... | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 545 | note | `parcel_total_ha_preregistered_interventention_note` | <span style="color:#099665"> ** Total area preregistered Interventions in thi... | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 546 | note | `parcel_total_ha_visited_interventention_note` | <span style="color:#099665"> ** Total area visited Interventions in this parc... | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 547 | note | `parcel_total_ha_validated_interventention_note` | <span style="color:#099665"> ** Total area validated Interventions in this pa... | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 548 | calculate | `parcel_percentage_ha_validated` |  | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 549 | note | `parcel_percentage_ha_validated_note` | <span style="color:##099612"> **🪴% of hectare validated:** </span> ${parcel_p... | contains(${parcel_interventions},'regenerative_agriculture') |  |  |
| 550 | note | `parcel_total_nb_of_trees_note` | <span style="color:#099665"> **Total number of living trees :** </span> ${par... | contains(${parcel_interventions},'agroforestry') |  |  |
| 551 | note | `parcel_total_length_note` | <span style="color:#099665"> **Total number of unique species planted :**</sp... | contains(${parcel_interventions},'agroforestry') |  |  |
| 552 | hidden | `parcel_risk_level` | Select the risk level for this parcel |  |  | True |
| 553 | image | `parcel_stm_photo` | Photo of the parcel |  |  |  |
| 554 | calculate | `species_1_nb_of_trees_living_out_farm` |  |  |  |  |
| 555 | calculate | `species_2_nb_of_trees_living_out_farm` |  |  |  |  |
| 556 | calculate | `species_3_nb_of_trees_living_out_farm` |  |  |  |  |
| 557 | calculate | `species_4_nb_of_trees_living_out_farm` |  |  |  |  |
| 558 | calculate | `species_5_nb_of_trees_living_out_farm` |  |  |  |  |
| 559 | calculate | `farm_total_nb_of_trees_out` |  |  |  |  |
| 560 | calculate | `farm_count` |  |  |  |  |
| 561 | calculate | `farm_relevant_count` |  |  |  |  |
| 562 | calculate | `species_1_nb_of_trees_out` |  |  |  |  |
| 563 | calculate | `species_2_nb_of_trees_out` |  |  |  |  |
| 564 | calculate | `species_3_nb_of_trees_out` |  |  |  |  |
| 565 | calculate | `species_4_nb_of_trees_out` |  |  |  |  |
| 566 | calculate | `species_5_nb_of_trees_out` |  |  |  |  |
| 567 | calculate | `total_nb_of_trees_out` |  |  |  |  |
| 568 | calculate | `producer_nb_validated_parcels` |  |  |  |  |
| 569 | calculate | `producer_nb_not_validated_parcels` |  |  |  |  |
| 570 | calculate | `producer_area_prereg` |  |  |  |  |
| 571 | calculate | `producer_area_stm` |  |  |  |  |
| 572 | calculate | `producer_validated_area_stm` |  |  |  |  |
| 573 | calculate | `sum_immature_trees_out_parcel` |  |  |  |  |
| 574 | calculate | `sum_trees_too_tall_out_parcel` |  |  |  |  |
| 575 | calculate | `sum_trees_stressed_out_parcel` |  |  |  |  |
| 576 | calculate | `sum_unhealthy_trees_out_parcel` |  |  |  |  |
| 577 | note | `producer_recap_note` | ##<span style="color:#1A5D97">**7. Producer Recapitulation**</span> |  |  |  |
| 578 | calculate | `nb_prereg_trees` |  |  |  |  |
| 579 | note | `producer_total_nb_validated_parcels_note` | <span style="color:#099665"> ** Validated Parcel in this producer:** </span> ... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 580 | note | `producer_total_nb_not_validated_parcels_note` | <span style="color:#099665"> ** Not Validated Parcel in this producer:** </sp... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 581 | note | `producer_area_prereg_note` | <span style="color:#099665"> ** Total area from Prereg in this producer:** </... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 582 | note | `producer_area_stm_note` | <span style="color:#099665"> ** Total area visited in this producer:** </span... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 583 | note | `producer_area_comparison` | <span style="color:#960965"> ** Total area STM is bigger than Prereg Value in... | ${producer_area_stm}>${producer_area_prereg} |  |  |
| 584 | note | `producer_validated_area_stm_note` | <span style="color:#099665"> ** Total validated area in this producer:** </sp... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 585 | calculate | `percentage_ha_validated` |  | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 586 | note | `percentage_ha_validated_note` | <span style="color:##099612"> **🪴% of hectare validated:** </span> ${percenta... | contains(${producer_interventions},'regenerative_agricult... |  |  |
| 587 | note | `nb_prereg_trees_note` | <span style="color:#099665"> **📄Trees preregistered:** </span> ${nb_prereg_tr... | contains(${producer_interventions},'agroforestry') |  |  |
| 588 | note | `nb_delivered_trees_recap_note` | <span style="color:#099665"> **🛻Trees delivered:** </span> ${nb_trees_deliver... | contains(${producer_interventions},'agroforestry') |  |  |
| 589 | note | `nb_planted_trees_recap_note` | <span style="color:#099665"> **🌳Trees planted:** </span> ${nb_trees_planted_p... | contains(${producer_interventions},'agroforestry') |  |  |
| 590 | note | `nb_living_trees_recap_note` | <span style="color:#099665"> **🌳Trees living:** </span> ${total_nb_of_trees_o... | contains(${producer_interventions},'agroforestry') |  |  |
| 591 | calculate | `percentage_trees_planted` |  | contains(${producer_interventions},'agroforestry') |  |  |
| 592 | note | `percentage_planted_trees_recap_note` | <span style="color:##099612"> **🪴% of living trees:** </span> ${percentage_tr... | contains(${producer_interventions},'agroforestry') |  |  |
| 593 | calculate | `species_1_nb_planted_trees_recap` |  |  |  |  |
| 594 | note | `species_1_nb_planted_trees_recap_note` | 🌳 Species 1 | ${species_1_nb_planted_trees_recap} > 0 |  |  |
| 595 | calculate | `species_2_nb_planted_trees_recap` |  |  |  |  |
| 596 | note | `species_2_nb_planted_trees_recap_note` | 🌳 Species 2 | ${species_2_nb_planted_trees_recap} > 0 |  |  |
| 597 | calculate | `species_3_nb_planted_trees_recap` |  |  |  |  |
| 598 | note | `species_3_nb_planted_trees_recap_note` | 🌳 Species 3 | ${species_3_nb_planted_trees_recap} > 0 |  |  |
| 599 | calculate | `species_4_nb_planted_trees_recap` |  |  |  |  |
| 600 | note | `species_4_nb_planted_trees_recap_note` | 🌳 Species 4 | ${species_4_nb_planted_trees_recap} > 0 |  |  |
| 601 | calculate | `species_5_nb_planted_trees_recap` |  |  |  |  |
| 602 | note | `species_5_nb_planted_trees_recap_note` | 🌳 Species 5 | ${species_5_nb_planted_trees_recap} > 0 |  |  |
| 603 | calculate | `living_vs_planted_ratio` |  |  |  |  |
| 604 | select_multiple reasons_difference | `planted_vs_distributed_difference_reasons` | What are the reasons of tree loss between the Planting Registry & the Short T... | ${living_vs_planted_ratio}>0 and (${stm_confirmation}='ye... |  | True |
| 605 | calculate | `producer_left_project_reasons` | Specify the reasons related to the producer leaving the project |  |  |  |
| 606 | select_multiple producer_made_planting_error_reasons | `producer_made_planting_error_reasons` | Specify the reasons related to the producer making a planting error | selected(${planted_vs_distributed_difference_reasons},'pr... |  | True |
| 607 | select_multiple reasons_difference_positive | `planted_vs_distributed_positive_difference_reasons` | What are the reasons for gap between the Planting Registry & the Short Term M... | ${living_vs_planted_ratio}<0 |  | True |
| 608 | select_multiple producer_leaving_reasons | `producer_leaving_reasons` | Why has the producer left the project? | selected(${planted_vs_distributed_difference_reasons},'pr... |  | True |
| 609 | calculate | `percentage_immature_trees` |  |  |  |  |
| 610 | calculate | `percentage_trees_too_tall` |  |  |  |  |
| 611 | calculate | `percentage_trees_stressed` |  |  |  |  |
| 612 | calculate | `percentage_trees_unhealthy` |  |  |  |  |
| 613 | note | `percentage_immature_trees_note` | <span style="color:#89b5c6">**Percentage of immature trees :**</span> ${perce... | ${percentage_trees_too_tall}>0 |  |  |
| 614 | note | `percentage_trees_too_tall_note` | <span style="color:#89b5c6">**Percentage of trees too tall :**</span> ${perce... | ${percentage_trees_stressed}>0 |  |  |
| 615 | note | `percentage_trees_stressed_note` | <span style="color:#89b5c6">**Percentage of stressed trees :**</span> ${perce... | ${percentage_trees_unhealthy}>0 |  |  |
| 616 | note | `percentage_trees_unhealthy_note` | <span style="color:#89b5c6">**Percentage of unhealthy trees:**</span> ${perce... | ${percentage_trees_unhealthy}>0 |  |  |
| 617 | note | `producer_recapitulation_note` | ##<span style="color:#1A5D97">**7. Technical prioritizaition**</span> |  |  |  |
| 618 | note | `project_objectives_reminder` | <span style="#082b22">Remind the producer of the project's objectives and rul... |  |  |  |
| 619 | hidden | `priority_level` | Select the priority level to assist the producer based on the level of risk |  |  | True |
| 620 | hidden | `recommendarion_picture_yes_no` | Did the producer receive a sheet with the recommendations? |  |  | True |
| 621 | hidden | `recommendation_picture` | Please, take a picture of the recommendation sheet | ${recommendarion_picture_yes_no}='yes' |  | True |
| 622 | note | `producer_agreement_note` | ##<span style="color:#1A5D97">**8. producer AGREEMENT**</span> |  |  |  |
| 623 | note | `producer_agreement_reminder` | The producer has not signed the producer Agreement yet. 
Please take the time... |  |  |  |
| 624 | select_one yes_no | `producer_agreement_picture_yn` | Would you like to take picture? If no you can upload a PDF |  |  |  |
| 625 | integer | `producer_agreement_nb_pages` | How many pages does the producer agreement contain? | ${producer_agreement_picture_yn} = 'yes' | .>0 |  |
| 626 | file | `producer_agreement_pdf` | Upload the PDF | ${producer_agreement_picture_yn} = 'no' |  |  |
| 627 | select_one yes_no | `producer_agreement_knowledge` | Does the producer confirm having knowledge of the producer agreement? |  |  |  |
| 628 | image | `producer_agreement_picture` | Take a picture of a page (click on "NEXT" to take a picture of next page) |  |  |  |
| 629 | text | `overall_comments` | Overall comments |  |  |  |
| 630 | image | `producer_signature` | Producer signature |  |  |  |
| 631 | image | `technician_signature` | Interviewer signature |  |  |  |

## 3. Groups & Repeats

### GROUP: `introduction`
- **Label**: 1. INTRODUCTION
- **Appearance**: field-list
- **Contains 11 direct fields**: `note1`, `note_test`, `tip`, `start`, `end`, `today`, `start-geopoint`, `project_id`, `planting_wave`, `subproject_id`
  ... and 1 more

### GROUP: `producer_general_info`
- **Label**: 2. Producer General Information
- **Appearance**: field-list
- **Contains 10 direct fields**: `producer_consent_yn`, `local_area_unit`, `local_area_unit_conv`, `total_area_land_owned`, `random_producer_number`, `producer_name`, `producer_code_other_producer`, `producer_code`, `producer_organization`, `producer_interventions`

### GROUP: `producer_introduction`
- **Label**: 2.1 Producer Introduction
- **Contains 3 direct fields**: `producer_introduction_note`, ``, `producer_present_yn`

### GROUP: `producer_representative_information`
- **Label**: Representative information
- **Relevant**: `${producer_present_yn} = 'no'`
- **Contains 12 direct fields**: `representative_info_note`, `representative_first_names`, `representative_last_name`, `representative_name`, `representative_identity_card_type`, `representative_identity_card_nb`, `representative_identity_card_picture`, `representative_phone_number`, `relation_with_producer`, `relation_with_producer_other`
  ... and 2 more

### GROUP: `producer_selection`
- **Label**: 2.2 Producer Selection
- **Contains 7 direct fields**: `producer_filter`, `producer_identity_card_nb_select`, `location_select`, `producer_organization_select`, `subproject_id_select`, `producer_code_select`, `prereg_delivery`

### GROUP: `producer_information_registered`
- **Label**: 2.3 Producer information - Registered
- **Relevant**: `${producer_code_select}!='other'`
- **Contains 58 direct fields**: `producer_info_registered_note`, `id_producer_pull`, `producer_code_pull`, `producer_name_pull`, `producer_photo_pull`, `producer_photo_pull_note`, `producer_id_type_pull`, `producer_id_pull`, `producer_id_photo_pull`, `producer_id_photo_pull_note`
  ... and 48 more

### GROUP: `producer_consent`
- **Label**: GDPR - Producer's consent
- **Relevant**: `${producer_present_yn} = 'no' or ${info_to_correct}='change_owner' or ${producer_code_select}='other'`
- **Contains 3 direct fields**: `note_consent_1`, `note_consent_representative`, `producer_consent_personal`

### GROUP: `producer_information_new`
- **Label**: 2.4 Producer information - New
- **Relevant**: `${producer_code_select}='other' or selected(${info_to_correct}, 'change_owner')`
- **Contains 15 direct fields**: `producer_information_new_note`, `producer_new_reasons`, `producer_type_new`, `producer_association_name_new`, `producer_association_identification_type_new`, `producer_association_identification_nb_new`, `producer_organization_new`, `producer_organization_other_new`, `producer_organization_sell_others_new`, `producer_organization_sell_others_comments_new`
  ... and 5 more

### GROUP: `producer_information_new_normal`
- **Label**: 2.4.1 Producer information - New
- **Relevant**: `${producer_present_yn} = 'yes' or ${representative_procuration_yn} = 'yes'`
- **Contains 15 direct fields**: `producer_association_information_note`, `producer_first_names_new`, `producer_last_name_new`, `producer_name_new`, `producer_identity_card_type_new`, `producer_identity_card_nb_new`, `producer_identity_card_picture_new`, `producer_identity_card_picture_back_new`, `producer_gender_new`, `producer_birth_date_new`
  ... and 5 more

### GROUP: `producer_information_new_anonymized`
- **Label**: 2.4.2 Producer information - New
- **Relevant**: `${representative_procuration_yn} = 'no'`
- **Contains 12 direct fields**: `producer_information_new_anonymized_note`, `producer_first_names_anonymized`, `producer_last_name_anonymized`, `producer_name_anonymized`, `producer_identity_card_type_anonymized`, `producer_identity_card_nb_anonymized`, `producer_gender_anonymized`, `producer_birth_date_anonymized`, `producer_phone_number_anonymized`, `producer_phone_number_other_anonymized`
  ... and 2 more

### GROUP: `producer_elegibility`
- **Label**: 2.4.3 Elegibility
- **Relevant**: `${producer_code_select}='other' or selected(${info_to_correct}, 'change_owner')`
- **Contains 4 direct fields**: `producer_participation_activities`, `producer_relevant_hint`, `producer_relevant_yn`, `producer_not_relevant_comments`

### GROUP: `short_term_monitoring`
- **Label**: 3. Short Term Monitoring
- **Relevant**: `selected(${stm_confirmation},'yes')`
- **Contains 0 direct fields**: 

### REPEAT: `farm`
- **Label**: FARM ${farm_nb} ${farm_legal_name}
- **Relevant**: `${producer_relevant_yn} = 'yes' or ${producer_code_select}!='other'`
- **Contains 17 direct fields**: `farm_producer_name`, `farm_producer_code`, `farm_nb`, `nb_farm`, `farm_prereg_yn`, `farm_prereg_yn_count`, `farm_nb_other`, `sum_parcel_prereg_yn_count`, `out_parcel_prereg_yn_count`, `nb_parcels_total`
  ... and 7 more

### GROUP: `farm_selection`
- **Label**: 3.1 Farm Selection
- **Appearance**: field-list
- **Contains 14 direct fields**: `farm_info_note`, `farm_id_select`, `farm_code_new`, `farm_code_prereg`, `farm_code`, `farm_label_nb`, `farm_label`, `farm_name_pull`, `farm_membership_id_pull`, `farm_name_pull_note`
  ... and 4 more

### GROUP: `farm_info_corrected`
- **Label**: 3.2 Farm Information Correction
- **Appearance**: field-list
- **Relevant**: `${farm_info_correction_yn}='yes'`
- **Contains 4 direct fields**: `farm_info_corrected_note`, `farm_name_corrected`, `farm_main_commodity_corrected`, `farm_membership_id_corrected`

### GROUP: `new_farm`
- **Label**: 3.3 New Farm
- **Relevant**: `${farm_id_select}='other'`
- **Contains 0 direct fields**: 

### GROUP: `farm_information`
- **Label**: 3.3.1 Farm information
- **Appearance**: field-list
- **Contains 32 direct fields**: `farm_location_level_1`, `farm_location_level_2`, `farm_location_level_3`, `farm_address`, `farm_legal_type`, `farm_legal_name`, `farm_identification_type`, `farm_identification_nb`, `farm_identification_nb_other`, `farm_main_crop`
  ... and 22 more

### GROUP: `farm_supply_chain_information`
- **Label**: 3.3.2 Supply chain information
- **Appearance**: field-list
- **Relevant**: `${producer_supply_chain_program_yn} = 'yes'`
- **Contains 30 direct fields**: `farm_supply_chain_information_note`, `supply_chain_mb_file_yn`, `supply_chain_mb_select`, `supply_chain_mb_name_pull`, `supply_chain_mb_cluster_pull`, `supply_chain_mb_subcluster_pull`, `supply_chain_mb_category_pull`, `supply_chain_mb_id_pull`, `supply_chain_mb_photo_pull`, `supply_chain_relation_with_producer_pull`
  ... and 20 more

### GROUP: `farm_elegibility`
- **Label**: 3.3.3 Elegibility
- **Appearance**: field-list
- **Relevant**: `${farm_id_select}='other'`
- **Contains 5 direct fields**: `farm_certification_pull`, `farm_certification`, `farm_relevant_hint`, `farm_relevant_yn`, `an`

### REPEAT: `parcel`
- **Label**: PARCEL ${parcel_nb} ${parcel_name}
- **Relevant**: `${farm_relevant_yn} = 'yes' or ${producer_code_select}!='other'`
- **Contains 32 direct fields**: `parcel_producer_name`, `parcel_producer_code`, `parcel_farm_name`, `parcel_farm_code`, `parcel_nb`, `nb_parcel`, `parcel_nb_other`, `parcel_nb_interventions`, `parcel_nb_validated_interventions`, `parcel_nb_not_validated_interventions`
  ... and 22 more

### GROUP: `parcel_selection`
- **Label**: 4.1 Parcel selection
- **Appearance**: field-list
- **Contains 19 direct fields**: `short_term_monitoring_note`, `parcel_selection_note`, `parcel_checking_stm`, `parcel_id_select`, `parcel_code_prereg`, `parcel_prereg_yn`, `parcel_prereg_yn_count`, `parcel_code_new`, `parcel_code`, `parcel_interventions_pull`
  ... and 9 more

### GROUP: `stm_dates`
- **Label**: 4.2 STM dates
- **Appearance**: field-list
- **Contains 14 direct fields**: `planting_dates_note`, `short_term_monitoring_date`, `planted_date_pull_registry`, `planted_trees_reminder_registry`, `species_1_nb_planted_trees_registry`, `species_1_nb_planted_trees_note_registry`, `species_2_nb_planted_trees_registry`, `species_2_nb_planted_trees_note_registry`, `species_3_nb_planted_trees_registry`, `species_3_nb_planted_trees_note_registry`
  ... and 4 more

### GROUP: `parcel_information`
- **Label**: 4.3 Parcel information
- **Contains 4 direct fields**: `sum_intervention_prereg_yn_count`, `out_intervention_prereg_yn_count`, `nb_interventions_total`, `registered_interventions_filter`

### GROUP: `new_parcel`
- **Label**: New parcel
- **Relevant**: `${parcel_id_select}='other'`
- **Contains 1 direct fields**: `geopoint_parcel`

### GROUP: `parcel_location`
- **Label**: 4.3.1 Location
- **Appearance**: field-list
- **Contains 6 direct fields**: `parcel_location_note`, `parcel_location_level_4`, `parcel_location_level_5`, `parcel_name`, `altitude_geopoint_parcel`, `picture_parcel`

### GROUP: `parcel_land_use`
- **Label**: 4.3.2 Land use
- **Appearance**: field-list
- **Relevant**: `${parcel_interventions}  = 'agroforestry'`
- **Contains 11 direct fields**: `parcel_land_use_note`, `parcel_parcel_deforested_yn`, `current_land_use`, `detailed_land_use`, `fallows_years_min`, `nb_years_land_considered_fallows`, `nb_years_land_considered_fallows_warning`, `current_land_status`, `detailed_agricultural_land_cover`, `detailed_agricultural_land_cover_other`
  ... and 1 more

### GROUP: `agro_ecological_characteristics`
- **Label**: 4.3.3 Agro-ecological characteristics
- **Appearance**: field-list
- **Relevant**: `${parcel_interventions}  = 'agroforestry'`
- **Contains 16 direct fields**: `agro_ecological_characteristics_note`, `slope_percentage`, `soil_texture`, `erosion_level`, `soil_stoniness`, `soil_depth_level`, `soil_ph`, `water_system_irrigation`, `crops_adapted_annual_rainfall`, `parcel_risk_water_yn`
  ... and 6 more

### GROUP: `land_tenure_parcel`
- **Label**: 4.3.4 Land tenure
- **Appearance**: field-list
- **Relevant**: `${parcel_interventions}  = 'agroforestry'`
- **Contains 13 direct fields**: `land_tenure_parcel_note`, `repeat_land_tenure_yn`, `legal_document_type`, `legal_document_name`, `legal_document_issue_agency`, `legal_document_access_yn`, `legal_document_authorization_yn`, `legal_document_producer_name_yn`, `legal_document_person_name`, `legal_document_relation`
  ... and 3 more

### GROUP: `legal_document`
- **Label**: 4.3.5 Legal document
- **Relevant**: `${legal_document_access_yn} = 'yes' and ${legal_document_authorization_yn} = 'yes' and ${legal_document_collection_method} = 'picture'`
- **Contains 1 direct fields**: `legal_document_nb_pages`

### REPEAT: `legal_document_picture_pages`
- **Label**: Take a picture of each pages of the legal document
- **Repeat Count**: `${legal_document_nb_pages}`
- **Contains 1 direct fields**: `legal_document_picture`

### GROUP: `parcel_elegibility`
- **Label**: 4.3.6 Eligibility
- **Appearance**: field-list
- **Contains 8 direct fields**: `parcel_elegibility_note`, `producer_plan_cut_trees_yn`, `producer_plan_cut_trees_reason`, `parcel_ineligible_for_implementation_note`, `parcel_nb_trees_want_to_cut`, `parcel_relevant_yn`, `parcel_not_relevant_explanation`, `parcel_not_relevant_comments`

### GROUP: `parcel_gps_track`
- **Label**: 4.3.7 Parcel GPS Track
- **Appearance**: field-list
- **Relevant**: `selected(${parcel_relevant_yn},'yes') or ${parcel_id_select}!='other'`
- **Contains 13 direct fields**: `parcel_gps_track_note`, `parcel_gps_method`, `parcel_checking`, `parcel_preload_select`, `parcel_preload_geometry_pull`, `track_note`, `geoshape_preload`, `area_preload`, `area_preload_note`, `geoshape_manual`
  ... and 3 more

### REPEAT: `intervention`
- **Label**: INTERVENTION
- **Relevant**: `selected(${parcel_relevant_yn},'yes') or ${parcel_id_select}!='other'`
- **Contains 4 direct fields**: `intervention_type_pull`, `intervention_type_select`, `stm_year_select`, `intervention_realized_yn`

### GROUP: `oa_section`
- **Label**: 🌱 Organic Amendment Section
- **Appearance**: field-list
- **Relevant**: `${intervention_type_select}='organic_amendment' and ${intervention_realized_yn}='yes'`
- **Contains 3 direct fields**: `oa_prereg_input`, `oa_prereg_stages`, `oa_prereg_dose`

### GROUP: `oa_y1`
- **Label**: OA Year 1 (y+1)
- **Relevant**: `${stm_year_select}='stm_y1'`
- **Contains 10 direct fields**: `oa_input_type_applied`, `oa_development_stage`, `oa_application_date`, `oa_dose_applied`, `oa_delivery_doc`, `oa_field_evidence`, `oa_issues`, `oa_issues_comment`, `oa_recap`, `oa_validation`

### GROUP: `oa_y2`
- **Label**: OA Year 2 (y+2)
- **Relevant**: `${stm_year_select}='stm_y2'`
- **Contains 15 direct fields**: `oa_same_area_y2`, `oa_area_scenario`, `oa_reason_same_area_diff_boundaries`, `oa_reason_new_area`, `oa_reason_different_parcel`, `oa_y2_input_type_applied`, `oa_y2_development_stage`, `oa_y2_application_date`, `oa_y2_dose_applied`, `oa_y2_delivery_doc`
  ... and 5 more

### GROUP: `oa_y2_gps_adjust`
- **Label**: GPS Track Adjustment
- **Relevant**: `${oa_area_scenario}='same_area_diff_boundaries'`
- **Contains 4 direct fields**: `oa_y2_adjusted_boundary`, `oa_y2_adjusted_area_ha`, `oa_y2_adjusted_area_mu`, `oa_y2_adjusted_area_note`

### GROUP: `oa_y2_new_area_grp`
- **Label**: New Area Registration
- **Relevant**: `${oa_area_scenario}='same_parcel_new_area'`
- **Contains 7 direct fields**: `oa_y2_new_area_desc`, `oa_y2_new_area_size_mu`, `oa_y2_new_area_gps`, `oa_y2_new_area_boundary`, `oa_y2_new_area_gps_ha`, `oa_y2_new_area_gps_mu`, `oa_y2_new_area_summary`

### GROUP: `oa_y2_simple_prereg`
- **Label**: Simplified Pre-Registry (New Parcel)
- **Relevant**: `${oa_area_scenario}='different_parcel'`
- **Contains 14 direct fields**: `oa_y2_prereg_intro`, `oa_y2_new_parcel_name`, `oa_y2_new_parcel_province`, `oa_y2_new_parcel_county`, `oa_y2_new_parcel_town`, `oa_y2_new_parcel_village`, `oa_y2_new_parcel_area_mu`, `oa_y2_new_parcel_area_ha`, `oa_y2_new_parcel_variety`, `oa_y2_new_parcel_gps`
  ... and 4 more

### GROUP: `four_r_section`
- **Label**: 🎯 4R Fertilizer Management
- **Appearance**: field-list
- **Relevant**: `${intervention_type_select}='4r_fertilizer' and ${intervention_realized_yn}='yes'`
- **Contains 4 direct fields**: `four_r_prereg_baseline_source`, `four_r_prereg_baseline_rate`, `four_r_prereg_baseline_time`, `four_r_prereg_baseline_place`

### GROUP: `four_r_y1`
- **Label**: 4R Year 1 (y+1)
- **Relevant**: `${stm_year_select}='stm_y1'`
- **Contains 13 direct fields**: `four_r_baselined_yn`, `four_r_baseline_now`, `four_r_baseline_evidence`, `four_r_y1_evidence`, `four_r_y1_issues`, `four_r_y1_issues_comment`, `four_r_source_improved`, `four_r_rate_improved`, `four_r_time_improved`, `four_r_place_improved`
  ... and 3 more

### GROUP: `four_r_baseline`
- **Label**: 4R.5: Baseline Levels
- **Relevant**: `${four_r_baseline_now}='yes' or ${four_r_baselined_yn}='yes'`
- **Contains 4 direct fields**: `four_r_baseline_source`, `four_r_baseline_rate`, `four_r_baseline_time`, `four_r_baseline_place`

### GROUP: `four_r_y1_levels`
- **Label**: 4R.6: Y+1 STM Levels
- **Contains 4 direct fields**: `four_r_y1_source`, `four_r_y1_rate`, `four_r_y1_time`, `four_r_y1_place`

### GROUP: `four_r_y2`
- **Label**: 4R Year 2 (y+2)
- **Relevant**: `${stm_year_select}='stm_y2'`
- **Contains 2 direct fields**: `four_r_same_area_y2`, `four_r_y2_validation`

### GROUP: `four_r_y2_same_area`
- **Label**: 4R Y+2 - Same Area
- **Relevant**: `${four_r_same_area_y2}='yes'`
- **Contains 13 direct fields**: `four_r_y2_source`, `four_r_y2_rate`, `four_r_y2_time`, `four_r_y2_place`, `four_r_y2_evidence`, `four_r_y2_issues`, `four_r_y2_issues_comment`, `four_r_source_maintained`, `four_r_rate_maintained`, `four_r_time_maintained`
  ... and 3 more

### GROUP: `four_r_y2_diff_area`
- **Label**: 4R Y+2 - Different Area
- **Relevant**: `${four_r_same_area_y2}='no'`
- **Contains 18 direct fields**: `four_r_area_scenario`, `four_r_reason_same_area_diff_boundaries`, `four_r_reason_new_area`, `four_r_reason_different_parcel`, `four_r_diff_area_note`, `four_r_y2_diff_source`, `four_r_y2_diff_rate`, `four_r_y2_diff_time`, `four_r_y2_diff_place`, `four_r_y2_diff_evidence`
  ... and 8 more

### GROUP: `four_r_y2_gps_adjust`
- **Label**: GPS Track Adjustment
- **Relevant**: `${four_r_area_scenario}='same_area_diff_boundaries'`
- **Contains 4 direct fields**: `four_r_y2_adjusted_boundary`, `four_r_y2_adjusted_area_ha`, `four_r_y2_adjusted_area_mu`, `four_r_y2_adjusted_area_note`

### GROUP: `four_r_y2_new_area_grp`
- **Label**: New Area Registration
- **Relevant**: `${four_r_area_scenario}='same_parcel_new_area'`
- **Contains 7 direct fields**: `four_r_y2_new_area_desc`, `four_r_y2_new_area_size_mu`, `four_r_y2_new_area_gps`, `four_r_y2_new_area_boundary`, `four_r_y2_new_area_gps_ha`, `four_r_y2_new_area_gps_mu`, `four_r_y2_new_area_summary`

### GROUP: `four_r_y2_simple_prereg`
- **Label**: Simplified Pre-Registry (New Parcel)
- **Relevant**: `${four_r_area_scenario}='different_parcel'`
- **Contains 14 direct fields**: `four_r_y2_prereg_intro`, `four_r_y2_new_parcel_name`, `four_r_y2_new_parcel_province`, `four_r_y2_new_parcel_county`, `four_r_y2_new_parcel_town`, `four_r_y2_new_parcel_village`, `four_r_y2_new_parcel_area_mu`, `four_r_y2_new_parcel_area_ha`, `four_r_y2_new_parcel_variety`, `four_r_y2_new_parcel_gps`
  ... and 4 more

### GROUP: `not_registered_interventions_group`
- **Label**: 5.9 Not registered planting models
- **Appearance**: field-list
- **Relevant**: `${prereg_delivery}='prereg'`
- **Contains 7 direct fields**: `not_registered_interventions__note`, `registered_interventions_from_prereg`, `not_registered_interventions_from_prereg`, `not_registered_interventions_note`, `finilize_with_missing_planting_models_yes_no`, `reasons_not_registered_planting_models`, `continue_registry_note`

### GROUP: `parcel_recapitulation`
- **Label**: 5.10 Parcel recapitulation
- **Appearance**: field-list
- **Contains 13 direct fields**: `note4`, `parcel_total_nb_interventions_note`, `parcel_list_interventions_note`, `parcel_total_nb_validated_interventention_note`, `parcel_total_ha_preregistered_interventention_note`, `parcel_total_ha_visited_interventention_note`, `parcel_total_ha_validated_interventention_note`, `parcel_percentage_ha_validated`, `parcel_percentage_ha_validated_note`, `parcel_total_nb_of_trees_note`
  ... and 3 more

### GROUP: `producer_recap`
- **Label**: 6. Producer recapitulation
- **Appearance**: field-list
- **Relevant**: `${producer_consent_personal}='gdpr_personal_yes' or ${producer_code_select}!='other'`
- **Contains 16 direct fields**: `producer_recap_note`, `nb_prereg_trees`, `producer_total_nb_validated_parcels_note`, `producer_total_nb_not_validated_parcels_note`, `producer_area_prereg_note`, `producer_area_stm_note`, `producer_area_comparison`, `producer_validated_area_stm_note`, `percentage_ha_validated`, `percentage_ha_validated_note`
  ... and 6 more

### GROUP: `recap_planted_trees`
- **Label**: Recap for living trees
- **Relevant**: `contains(${producer_interventions},'agroforestry')`
- **Contains 24 direct fields**: `species_1_nb_planted_trees_recap`, `species_1_nb_planted_trees_recap_note`, `species_2_nb_planted_trees_recap`, `species_2_nb_planted_trees_recap_note`, `species_3_nb_planted_trees_recap`, `species_3_nb_planted_trees_recap_note`, `species_4_nb_planted_trees_recap`, `species_4_nb_planted_trees_recap_note`, `species_5_nb_planted_trees_recap`, `species_5_nb_planted_trees_recap_note`
  ... and 14 more

### GROUP: `technical_assessment`
- **Label**: 7.Technical priorization
- **Appearance**: field-list
- **Contains 5 direct fields**: `producer_recapitulation_note`, `project_objectives_reminder`, `priority_level`, `recommendarion_picture_yes_no`, `recommendation_picture`

### GROUP: `producer_agreement`
- **Label**: 8. Producer agreement
- **Appearance**: field-list
- **Relevant**: `${producer_consent_personal}='gdpr_personal_yes'`
- **Contains 6 direct fields**: `producer_agreement_note`, `producer_agreement_reminder`, `producer_agreement_picture_yn`, `producer_agreement_nb_pages`, `producer_agreement_pdf`, `producer_agreement_knowledge`

### REPEAT: `producer_agreement_pages`
- **Label**: 8. Producer agreement pages
- **Relevant**: `${producer_agreement_picture_yn}= 'yes' and ${producer_agreement_nb_pages} > 0`
- **Repeat Count**: `${producer_agreement_nb_pages}`
- **Contains 1 direct fields**: `producer_agreement_picture`

### GROUP: `signatures`
- **Label**: 9. Signatures
- **Contains 3 direct fields**: `overall_comments`, `producer_signature`, `technician_signature`

## 4. pulldata() Usage

| Field Name | Expression | CSV File | Key Column | Value Column |
|------------|-----------|----------|------------|--------------|
| `prereg_delivery` | `pulldata('pulldata_producer_stm', 'prereg_delivery', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | prereg_delivery |
| `id_producer_pull` | `pulldata('pulldata_producer_stm', 'id_producer', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | id_producer |
| `producer_code_pull` | `pulldata('pulldata_producer_stm', 'producer_code', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_code |
| `producer_name_pull` | `pulldata('pulldata_producer_stm', 'producer_name', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_name |
| `producer_photo_pull` | `pulldata('pulldata_producer_stm', 'producer_picture', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_picture |
| `producer_id_type_pull` | `pulldata('pulldata_producer_stm', 'producer_id_type', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_id_type |
| `producer_id_pull` | `pulldata('pulldata_producer_stm', 'producer_id', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_id |
| `producer_id_photo_pull` | `pulldata('pulldata_producer_stm', 'producer_id_picture', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_id_picture |
| `producer_phone_number_pull` | `pulldata('pulldata_producer_stm', 'producer_phone_number', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_phone_number |
| `producer_phone_number_other_pull` | `pulldata('pulldata_producer_stm', 'producer_phone_number_other', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_phone_number_other |
| `producer_email_pull` | `pulldata('pulldata_producer_stm', 'email_address', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | email_address |
| `producer_gender_pull` | `pulldata('pulldata_producer_stm', 'producer_gender', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_gender |
| `producer_birth_date_pull` | `pulldata('pulldata_producer_stm', 'producer_birth_date', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_birth_date |
| `producer_age_pull` | `pulldata('pulldata_producer_stm', 'producer_age', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_age |
| `local_area_unit_pull` | `pulldata('pulldata_producer_stm', 'local_area_unit', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | local_area_unit |
| `total_area_land_owned_pull` | `pulldata('pulldata_producer_stm', 'total_area_land_owned', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | total_area_land_owned |
| `producer_organization_pull` | `pulldata('pulldata_producer_stm', 'producer_organization', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_organization |
| `producer_interventions_pull` | `pulldata('pulldata_producer_stm', 'producer_interventions', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_interventions |
| `nb_parcels_registered_pull` | `pulldata('pulldata_producer_stm', 'nb_parcels_preregistred', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_parcels_preregistred |
| `nb_parcels_planted_pull` | `pulldata('pulldata_producer_stm', 'nb_parcels_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_parcels_planted |
| `nb_trees_delivered_pull` | `pulldata('pulldata_producer_stm', 'nb_trees_delivered', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_trees_delivered |
| `nb_trees_planted_pull` | `pulldata('pulldata_producer_stm', 'nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_trees_planted |
| `producer_planted_rate_pull` | `pulldata('pulldata_producer_stm', 'producer_planted_rate', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_planted_rate |
| `producer_nb_parcel_sample_pull` | `pulldata('pulldata_producer_stm', 'nb_sample_parcels', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_sample_parcels |
| `producer_identity_card_type_corrected` | `pulldata('pulldata_producer_stm', 'producer_id_type', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_id_type |
| `producer_identity_card_nb_corrected` | `pulldata('pulldata_producer_stm', 'producer_id', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_id |
| `producer_phone_number_corrected` | `pulldata('pulldata_producer_stm', 'producer_phone_number', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_phone_number |
| `producer_phone_number_other_corrected` | `pulldata('pulldata_producer_stm', 'producer_phone_number_other', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_phone_number_other |
| `producer_email_corrected` | `pulldata('pulldata_producer_stm', 'email_address', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | email_address |
| `producer_gender_corrected` | `pulldata('pulldata_producer_stm', 'producer_gender', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_gender |
| `producer_birth_date_corrected` | `pulldata('pulldata_producer_stm', 'producer_birth_date', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_birth_date |
| `producer_age_corrected` | `pulldata('pulldata_producer_stm', 'producer_age', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_age |
| `producer_organization_corrected` | `pulldata('pulldata_producer_stm', 'producer_organization', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_organization |
| `local_area_unit_corrected` | `pulldata('pulldata_producer_stm', 'local_area_unit', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | local_area_unit |
| `total_area_land_owned_corrected` | `pulldata('pulldata_producer_stm', 'total_area_land_owned', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | total_area_land_owned |
| `producer_mb_id_corrected` | `pulldata('pulldata_producer_stm', 'producer_mb_id', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | producer_mb_id |
| `location_level_1_corrected` | `pulldata('pulldata_producer_stm', 'location_level_1', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | location_level_1 |
| `location_level_2_corrected` | `pulldata('pulldata_producer_stm', 'location_level_2', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | location_level_2 |
| `location_level_3_corrected` | `pulldata('pulldata_producer_stm', 'location_level_3', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | location_level_3 |
| `location_level_4_corrected` | `pulldata('pulldata_producer_stm', 'location_level_4', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | location_level_4 |
| `nb_farms_total` | `pulldata('pulldata_producer_stm', 'nb_farms_total', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_farms_total |
| `farm_code_prereg` | `pulldata('pulldata_farm_stm', 'farm_code', 'farm_id', ${farm_id_select})` | pulldata_farm_stm.csv | farm_id | farm_code |
| `farm_name_pull` | `pulldata('pulldata_farm_stm', 'farm_legal_name', 'farm_code', ${farm_id_select})` | pulldata_farm_stm.csv | farm_code | farm_legal_name |
| `farm_membership_id_pull` | `pulldata('pulldata_farm_stm', 'membership_id', 'farm_code', ${farm_id_select})` | pulldata_farm_stm.csv | farm_code | membership_id |
| `farm_main_commodity_pull_note` | `pulldata('pulldata_farm_stm', 'farm_main_crop', 'farm_code', ${farm_id_select})` | pulldata_farm_stm.csv | farm_code | farm_main_crop |
| `supply_chain_mb_name_pull` | `pulldata('supply_chain_member', 'supply_chain_mb_name', 'name', ${supply_chain_mb_select})` | supply_chain_member.csv | name | supply_chain_mb_name |
| `supply_chain_mb_name_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_name', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_name |
| `supply_chain_mb_cluster_pull` | `pulldata('supply_chain_member', 'supply_chain_mb_cluster', 'name', ${supply_chain_mb_select})` | supply_chain_member.csv | name | supply_chain_mb_cluster |
| `supply_chain_mb_cluster_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_cluster', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_cluster |
| `supply_chain_mb_subcluster_pull` | `pulldata('supply_chain_member', 'supply_chain_mb_subcluster', 'name', ${supply_chain_mb_select})` | supply_chain_member.csv | name | supply_chain_mb_subcluster |
| `supply_chain_mb_subcluster_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_subcluster', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_subcluster |
| `supply_chain_mb_category_pull` | `pulldata('supply_chain_member', 'supply_chain_mb_category', 'name', ${supply_chain_mb_select})` | supply_chain_member.csv | name | supply_chain_mb_category |
| `supply_chain_mb_category_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_category', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_category |
| `supply_chain_mb_id_pull` | `pulldata('supply_chain_member', 'supply_chain_mb_id', 'name', ${supply_chain_mb_select})` | supply_chain_member.csv | name | supply_chain_mb_id |
| `supply_chain_mb_id_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_id', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_id |
| `supply_chain_mb_photo_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_mb_photo', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_mb_photo |
| `supply_chain_relation_with_producer_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_relation_with_producer', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_relation_with_producer |
| `supply_chain_relation_with_producer_other_pull` | `pulldata('pulldata_farm_preregistry', 'supply_chain_relation_with_producer_other', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | supply_chain_relation_with_producer_other |
| `farm_certification_pull` | `pulldata('pulldata_farm_preregistry', 'farm_certification_pull', 'farm_id', ${farm_id_select})` | pulldata_farm_preregistry.csv | farm_id | farm_certification_pull |
| `nb_parcels_total` | `pulldata('pulldata_farm_stm', 'nb_parcels_total', 'producer_code', ${producer_code_select})` | pulldata_farm_stm.csv | producer_code | nb_parcels_total |
| `parcel_code_prereg` | `pulldata('pulldata_parcel_stm', 'parcel_code', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | parcel_code |
| `parcel_interventions_pull` | `pulldata('pulldata_parcel_stm', 'parcel_interventions', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | parcel_interventions |
| `parcel_sampling_yn_pull` | `pulldata('pulldata_parcel_stm', 'parcel_sampling_yn', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | parcel_sampling_yn |
| `planted_trees_hint_yn_pull` | `pulldata('pulldata_parcel_stm', 'planted_trees_hint_yn', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | planted_trees_hint_yn |
| `planted_date_pull_registry` | `pulldata('pulldata_producer_stm', 'delivery_date', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | delivery_date |
| `species_1_nb_planted_trees_registry` | `pulldata('pulldata_producer_stm', 'species_1_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_1_nb_trees_planted |
| `species_2_nb_planted_trees_registry` | `pulldata('pulldata_producer_stm', 'species_2_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_2_nb_trees_planted |
| `species_3_nb_planted_trees_registry` | `pulldata('pulldata_producer_stm', 'species_3_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_3_nb_trees_planted |
| `species_4_nb_planted_trees_registry` | `pulldata('pulldata_producer_stm', 'species_4_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_4_nb_trees_planted |
| `species_5_nb_planted_trees_registry` | `pulldata('pulldata_producer_stm', 'species_5_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_5_nb_trees_planted |
| `parcel_preload_geometry_pull` | `pulldata('pulldata_parcel_stm', 'gps', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | gps |
| `nb_interventions_total` | `pulldata('pulldata_parcel_stm', 'nb_interventions', 'parcel_code', ${parcel_id_select})` | pulldata_parcel_stm.csv | parcel_code | nb_interventions |
| `intervention_type_pull` | `pulldata('pulldata_intervention_stm', 'intervention_type', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | intervention_type |
| `oa_prereg_input` | `pulldata('pulldata_intervention_stm', 'prereg_input_type', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_input_type |
| `oa_prereg_stages` | `pulldata('pulldata_intervention_stm', 'prereg_development_stages', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_development_stages |
| `oa_prereg_dose` | `pulldata('pulldata_intervention_stm', 'prereg_dose_total', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_dose_total |
| `four_r_prereg_baseline_source` | `pulldata('pulldata_intervention_stm', 'prereg_4r_baseline_source', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_4r_baseline_source |
| `four_r_prereg_baseline_rate` | `pulldata('pulldata_intervention_stm', 'prereg_4r_baseline_rate', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_4r_baseline_rate |
| `four_r_prereg_baseline_time` | `pulldata('pulldata_intervention_stm', 'prereg_4r_baseline_time', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_4r_baseline_time |
| `four_r_prereg_baseline_place` | `pulldata('pulldata_intervention_stm', 'prereg_4r_baseline_place', 'parcel_code', ${parcel_id_select})` | pulldata_intervention_stm.csv | parcel_code | prereg_4r_baseline_place |
| `nb_prereg_trees` | `pulldata('pulldata_producer_stm', 'nb_trees_prereg', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | nb_trees_prereg |
| `species_1_nb_planted_trees_recap` | `pulldata('pulldata_producer_stm', 'species_1_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_1_nb_trees_planted |
| `species_2_nb_planted_trees_recap` | `pulldata('pulldata_producer_stm', 'species_2_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_2_nb_trees_planted |
| `species_3_nb_planted_trees_recap` | `pulldata('pulldata_producer_stm', 'species_3_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_3_nb_trees_planted |
| `species_4_nb_planted_trees_recap` | `pulldata('pulldata_producer_stm', 'species_4_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_4_nb_trees_planted |
| `species_5_nb_planted_trees_recap` | `pulldata('pulldata_producer_stm', 'species_5_nb_trees_planted', 'producer_code', ${producer_code_select})` | pulldata_producer_stm.csv | producer_code | species_5_nb_trees_planted |

## 5. Choice Lists

| List Name | Option Count | Options (first 5) |
|-----------|-------------|-------------------|
| `4r_level` | 4 | level_1, level_2, level_3, level_4 |
| `G` | 1 | delayed_sowing_late |
| `activities` | 5 | socialization, activity_1, activity_2, activity_3, none |
| `area_scenario` | 3 | same_area_diff_boundaries, same_parcel_new_area, different_parcel |
| `area_unit` | 7 | ha, acre, m2, mu, km2 ... +2 more |
| `cc_efficiency` | 4 | less_than_1 ton_dry_matter per_ha_, between_1_and 2_ton_dry matter_per_ha, between_2_and 3_ton_dry matter_per_ha, more_than_3 ton_dry_matter per_ha |
| `certifications` | 4 | conventional, organic_certified, organic_non_certified, none |
| `confirmation_statement` | 1 | yes |
| `covercrop_management` | 8 | rolling_after_sowing, fertilization, buried_residues, herbicide, growth_regulator ... +3 more |
| `crop_cycle` | 4 | sowing, growth, hight_production, declined_production |
| `data_correction` | 13 | change_owner, producer_name_corrected, producer_identity_card_type_corrected, producer_identity_card_nb_corrected, producer_identity_card_picture_corrected ... +8 more |
| `deforested_yn` | 4 | yes, no, idk, farmer_was_not_owner_of_the_land |
| `destruction_method` | 6 | chemical, mulching, plowing, frost, rolling ... +1 more |
| `detailed_agricultural_land_cover` | 48 | rice, soy, wheat, cotton, beans ... +43 more |
| `detailed_land_use` | 29 | secondary_forest, low_fallows, medium_fallows, high_fallows, coffee_growth ... +24 more |
| `development_stage` | 5 | planting_and_germination, leaf_growth, bulbing, garlic_scape_harvest, garlic_bulb_harvest |
| `document_type` | 2 | pdf, picture |
| `erosion` | 4 | none, low, moderate, high |
| `farm_info_corrected` | 3 | farm_name_corrected, farm_main_commodity_corrected, farm_membership_id_corrected |
| `gdpr` | 2 | gdpr_personal_yes, gdpr_personal_no |
| `id_type` | 8 | national_id_card, hukou, passport, driving_license, business_license ... +3 more |
| `infrastructure_risk` | 5 | power_line, drain, building, gas_pipe, road |
| `intervention` | 2 | other, regenerative_agriculture |
| `intervention_type` | 2 | organic_amendment, 4r_fertilizer |
| `interviewer` | 4 | tech_wang, tech_li, tech_zhang, other |
| `issue_agency` | 5 | county_land_bureau, township_govt, village_committee, agri_bureau, other |
| `join_reason` | 2 | reason_a, reason_b |
| `land_cover` | 72 | rice, soy, wheat, cotton, beans ... +67 more |
| `land_cover_category` | 7 | annual_crops, permanent_crops, pastures, heterogeneous_agricultural_areas, forests ... +2 more |
| `land_status` | 3 | productive, non_productive, temporary_resting |
| `land_tenure` | 22 | legal_land_title_registered, community_land, public_land, right_to_use_manage, ownership_title ... +17 more |
| `land_tenure_name` | 6 | land_use_right_cert, rural_land_contract, collective_land_cert, land_transfer_agreement, rental_agreement ... +1 more |
| `land_use` | 5 | fallows, pasture, perennial, annual, forest |
| `location_level_1` | 6 | shandong, henan, jiangsu, yunnan, sichuan ... +1 more |
| `location_level_2` | 11 | jinxiang, juye, chengwu, jiaxiang, yutai ... +6 more |
| `location_level_3` | 18 | yushan, mamiao, huji, huayu, gaohe ... +13 more |
| `not_planted_reasons` | 3 | producer_unable_to_plant, producer_waiting_to_plant, producer_participation_risk |
| `not_relevant` | 6 | land_use_not_suitable, location_not_suitable, soil_conditions_not_suitable, climatic_conditions_not_suitable, no_land_tenure_linked_to_the_parcel ... +1 more |
| `parcel_gps_method` | 2 | preload_gps, take_gps |
| `pest_disease_level` | 3 | none, medium, strong |
| `priority_level` | 3 | low, medium, high |
| `producer_decided_not_plant_reasons` | 5 | producer_sold_trees, producer_exchanged_trees, producer_issue_seedling_quality, producer_issue_species_delivered, producer_will_plant_next_year |
| `producer_filter` | 4 | location, organization, subprojectid, id |
| `producer_gender` | 5 | f, m, n, u, p |
| `producer_leaving_reasons` | 4 | producer_died, producer_sold_land, producer_is_in_another_project, producer_does_not_agree |
| `producer_made_planting_error_reasons` | 3 | producer_planted_another_parcel, producer_planted_another_farm_outside_supplychain, producer_planted_another_farm_inside_supplychain |
| `producer_organization` | 4 | jinxiang_garlic_coop, lunan_agri, cangshan_garlic_assoc, other |
| `producer_participation_risk` | 3 | producer_lost_interest, producer_died, other |
| `producer_priority` | 3 | low, medium, high |
| `producer_type` | 2 | individual, association |
| `producer_unable_to_plant` | 7 | producer_busy, producer_health_issues, producer_lacked_money_or_labour, parcel_not_accesible, security_issue ... +2 more |
| `producer_unable_to_plant_reasons` | 4 | producer_was_busy_with_farm_activities, producer_lack_money, producer_health_problems, parcel_not_accesible |
| `producer_waiting_to_plant` | 3 | producer_waits_tree_acclimatization, producer_waits_better_weather, other |
| `quality_issues` | 4 | trees_too_small, tress_too_big, trees_slightly_stressed, trees_very_unhealthy |
| `reason_to_cut` | 7 | old_dying_trees, sick_trees, invasive_species, non_suitable_species_for_the_crop, harvesting_time_for_timber ... +2 more |
| `reasons_difference` | 5 | predateur_pest_and_disease, livestock, extreme_event, climatic, managment |
| `reasons_difference_positive` | 3 | producer_received_trees, producer_bought_trees, other |
| `reasons_not_registered_planting_models` | 5 | not_available, too_expensive, not_suitable, lack_knowledge, other |
| `regag_issue_cc` | 12 | unavail_reccommend_seed, mismanaged_sowing_density, delayed_sowing_weather, poor_emergence_weather, poor_emergence_high_residue ... +7 more |
| `regag_parcel_location` | 2 | same_parcel, different_parcel |
| `relation` | 6 | family_member_spouse, worker, community_or_farmer_lead, legal_rep, cooperative_delegate ... +1 more |
| `soil_depth` | 4 | category_1, category_2, category_3, category_4 |
| `soil_stoniness` | 4 | none, low, moderate, high |
| `soil_texture` | 7 | sandy, loam_clay, loam, loam_sandy, clay ... +2 more |
| `sowing_method` | 12 | combined_rh_discs, combined_rh_tines, direct_drill_and_tines, direct_drill_and_discs, high_speed_drill_and_tines ... +7 more |
| `species_cc` | 52 | avena_sativa, avena_strigosa, camelina_sativa, brassica_napus, trigonella_foenum_graecum ... +47 more |
| `species_on_parcel` | 10 | garlic, wheat, corn, cotton, peanut ... +5 more |
| `stm_issues` | 9 | pest_disease, weather_damage, soil_degradation, water_shortage, input_quality ... +4 more |
| `stm_year` | 2 | stm_y1, stm_y2 |
| `subproject` | 1 | cn_garlic_stm |
| `supply_chain_cluster` | 5 | supply_chain_cluster1, supply_chain_cluster2, supply_chain_cluster3, supply_chain_cluster4, supply_chain_cluster5 |
| `supply_chain_program` | 3 | garlic_stm, other, none |
| `supply_chain_subcluster` | 5 | supply_chain_subcluster_1, supply_chain_subcluster_2, supply_chain_subcluster_3, supply_chain_subcluster_4, supply_chain_subcluster_5 |
| `trees_lost_before_planting_reasons` | 6 | trees_failed_to_acclimatize, trees_died_mismanagement, trees_died_animal_damage, trees_were_stolen, representative_did_not_give_trees ... +1 more |
| `type_input` | 10 | urea, calcium_ammonium_nitrate, other_mineral, cattle_manure_compost, enriched_compost ... +5 more |
| `water_risk` | 3 | water_body_in_the_parcel, water_body_adjacent_to_the_parcel, sensitive_water_under_specific_regulation |
| `weed_competition` | 4 | none, little, medium, severe |
| `yes_no` | 2 | yes, no |
| `yes_no_idk` | 3 | yes, no, idk |

## 6. Cascading Selects (choice_filter)

| Field Name | Type | Choice Filter |
|------------|------|--------------|
| `representative_identity_card_type` | select_one id_type | `F1 != 'association'` |
| `producer_code_select` | select_one_from_file producer_name.csv | `(${producer_filter} = 'subprojectid' and subprojectid=${subproject_id_select}) or (${producer_filter} = 'organization' and organization=${producer_organization_select}) or (${producer_filter} = 'location' and farm_location_level_1=${location_select}) or (${producer_filter} = 'id' and identification_nb=${producer_identity_card_nb_select}) or name='other'` |
| `producer_association_identification_type_new` | select_one id_type | `F1 = 'other' or F1 = 'association'` |
| `producer_identity_card_type_new` | select_one id_type | `F1 != 'association'` |
| `farm_id_select` | select_one_from_file farm.csv | `producer_id = -1 or (producer_id = ${producer_code_select} and not(contains(${registered_farms},filter)))` |
| `farm_location_level_2` | select_one location_level_2 | `location=${farm_location_level_1}` |
| `farm_location_level_3` | select_one location_level_3 | `location=${farm_location_level_2}` |
| `farm_identification_type` | select_one id_type | `F1 = 'other' or F1 ='association'` |
| `farm_other_crop` | select_multiple detailed_agricultural_land_cover | `F1 != ${farm_main_crop}` |
| `parcel_id_select` | select_one_from_file parcel.csv | `farm_id = -1 or (farm_id = ${farm_id_select} and not(contains(${registered_parcels},filter)))` |
| `detailed_land_use` | select_multiple land_cover | `F1 = ${current_land_use}` |
| `current_land_status` | select_one land_status | `selected(${detailed_land_use}, F1 ) or 
selected(${detailed_land_use}, F2 ) or 
selected(${detailed_land_use}, F3 ) or 
selected(${detailed_land_use}, F4 ) or 
selected(${detailed_land_use}, F5 ) or 
selected(${detailed_land_use}, F6 ) or 
selected(${detailed_land_use}, F7 ) or 
selected(${detailed_land_use}, F8 ) or 
selected(${detailed_land_use}, F9 ) or 
selected(${detailed_land_use}, F10 ) or 
selected(${detailed_land_use}, F11 ) or 
selected(${detailed_land_use}, F12 ) or 
selected(${detailed_land_use}, F13 ) or 
selected(${detailed_land_use}, F14 ) or 
selected(${detailed_land_use}, F15 ) or 
selected(${detailed_land_use}, F16 ) or 
selected(${detailed_land_use}, F17 ) or 
selected(${detailed_land_use}, F18 ) or 
selected(${detailed_land_use}, F19 ) or 
selected(${detailed_land_use}, F20 ) or 
selected(${detailed_land_use}, F21 ) or 
selected(${detailed_land_use}, F22 ) or 
selected(${detailed_land_use}, F23 ) or 
selected(${detailed_land_use}, F24 ) or 
selected(${detailed_land_use}, F25 ) or 
selected(${detailed_land_use}, F26 ) or 
selected(${detailed_land_use}, F27 ) or 
selected(${detailed_land_use}, F28 ) or 
selected(${detailed_land_use}, F29 ) or 
selected(${detailed_land_use}, F30 ) or 
selected(${detailed_land_use}, F31 ) or 
selected(${detailed_land_use}, F32 ) or 
selected(${detailed_land_use}, F33 ) or 
selected(${detailed_land_use}, F34 ) or 
selected(${detailed_land_use}, F35 ) or 
selected(${detailed_land_use}, F36 ) or 
selected(${detailed_land_use}, F37 ) or 
selected(${detailed_land_use}, F38 ) or 
selected(${detailed_land_use}, F39 ) or 
selected(${detailed_land_use}, F40 ) or 
selected(${detailed_land_use}, F41 ) or 
selected(${detailed_land_use}, F42 ) or 
selected(${detailed_land_use}, F43 ) or 
selected(${detailed_land_use}, F44 ) or 
selected(${detailed_land_use}, F45 ) or 
selected(${detailed_land_use}, F46 ) or 
selected(${detailed_land_use}, F47 ) or 
selected(${detailed_land_use}, F48 ) or 
selected(${detailed_land_use}, F49 ) or 
selected(${detailed_land_use}, F50 ) or 
selected(${detailed_land_use}, F51 ) or 
selected(${detailed_land_use}, F52 ) or 
selected(${detailed_land_use}, F53 ) or 
selected(${detailed_land_use}, F54 ) or 
selected(${detailed_land_use}, F55 ) or 
selected(${detailed_land_use}, F56 ) or 
selected(${detailed_land_use}, F57 ) or 
selected(${detailed_land_use}, F58 ) or 
selected(${detailed_land_use}, F59 ) or 
selected(${detailed_land_use}, F60 ) or 
selected(${detailed_land_use}, F61 ) or 
selected(${detailed_land_use}, F62 ) or 
selected(${detailed_land_use}, F63 ) or 
selected(${detailed_land_use}, F64 ) or 
selected(${detailed_land_use}, F65 ) or 
selected(${detailed_land_use}, F66 ) or 
selected(${detailed_land_use}, F67 ) or 
selected(${detailed_land_use}, F68 ) or 
selected(${detailed_land_use}, F69 )` |
| `oa_y2_new_parcel_county` | select_one location_level_2 | `location=${oa_y2_new_parcel_province}` |
| `oa_y2_new_parcel_town` | select_one location_level_3 | `location=${oa_y2_new_parcel_county}` |
| `four_r_y2_new_parcel_county` | select_one location_level_2 | `location=${four_r_y2_new_parcel_province}` |
| `four_r_y2_new_parcel_town` | select_one location_level_3 | `location=${four_r_y2_new_parcel_county}` |

## 7. Calculate Fields

| Name | Calculation |
|------|------------|
| `registry_type` | `"short_term_monitoring"` |
| `form_status` | `"standard_dev"` |
| `form_location_2` | `indexed-repeat(${farm_location_level_2}, ${farm}, 1)` |
| `project_id` | `"project_id"` |
| `planting_wave` | `"wXX"` |
| `representative_name` | `concat(${representative_first_names}, ' ', ${representative_last_name})` |
| `prereg_delivery` | `pulldata('pulldata_producer_stm','prereg_delivery','producer_code',${producer_code_select})` |
| `id_producer_pull` | `pulldata('pulldata_producer_stm','id_producer','producer_code',${producer_code_select})` |
| `producer_code_pull` | `pulldata('pulldata_producer_stm','producer_code','producer_code',${producer_code_select})` |
| `producer_photo_pull` | `pulldata('pulldata_producer_stm','producer_picture','producer_code',${producer_code_select})` |
| `producer_id_photo_pull` | `pulldata('pulldata_producer_stm','producer_id_picture','producer_code',${producer_code_select})` |
| `total_area_land_owned_pull` | `pulldata('pulldata_producer_stm','total_area_land_owned','producer_code',${producer_code_select})` |
| `nb_parcels_registered_pull` | `pulldata('pulldata_producer_stm','nb_parcels_preregistred','producer_code',${producer_code_select})` |
| `nb_parcels_planted_pull` | `pulldata('pulldata_producer_stm','nb_parcels_planted','producer_code',${producer_code_select})` |
| `nb_trees_delivered_pull` | `pulldata('pulldata_producer_stm','nb_trees_delivered','producer_code',${producer_code_select})` |
| `nb_trees_planted_pull` | `pulldata('pulldata_producer_stm','nb_trees_planted','producer_code',${producer_code_select})` |
| `producer_planted_rate_pull` | `pulldata('pulldata_producer_stm','producer_planted_rate','producer_code',${producer_code_select})` |
| `producer_nb_parcel_sample_pull` | `pulldata('pulldata_producer_stm','nb_sample_parcels','producer_code',${producer_code_select})` |
| `producer_name_corrected` | `concat(${producer_first_name_corrected},'_',${producer_last_name_corrected})` |
| `producer_consent_yn` | `"yes"` |
| `producer_name_new` | `concat(${producer_first_names_new},' ',${producer_last_name_new})` |
| `producer_first_names_anonymized` | `if( ${representative_procuration_yn} = 'no', concat('represented by ', ${representative_first_names}), '')` |
| `producer_last_name_anonymized` | `if( ${representative_procuration_yn} = 'no', concat('represented by ', ${representative_last_name}), '')` |
| `producer_name_anonymized` | `if( ${representative_procuration_yn} = 'no', concat('represented by ', ${representative_name}), '')` |
| `producer_identity_card_type_anonymized` | `if( ${representative_procuration_yn} = 'no', 'none', '')` |
| `producer_identity_card_nb_anonymized` | `if( ${representative_procuration_yn} = 'no', if( ${representative_identity_card_nb}='', 'none', concat('represented b...` |
| `producer_gender_anonymized` | `if( ${representative_procuration_yn} = 'no', 'u', '')` |
| `producer_birth_date_anonymized` | `if( ${representative_procuration_yn} = 'no', '1900-01-01', '')` |
| `producer_relevant_hint` | `"A producer is elegible when: ** Add citeria by each project **
Example: the producer participated in the past and ha...` |
| `local_area_unit` | `if(${producer_code_select}='other', ${local_area_unit_new}, coalesce(${local_area_unit_corrected}, ${local_area_unit_...` |
| `local_area_unit_conv` | `if(${local_area_unit} = 'ha', 1,if(${local_area_unit} = 'km2', 100,if(${local_area_unit} = 'm2', 0.0001,if(${local_ar...` |
| `total_area_land_owned` | `coalesce( if(${producer_code_select}='other', ${total_area_land_owned_new}, coalesce(${total_area_land_owned_correcte...` |
| `random_producer_number` | `once(concat(format-date-time(now(),'%m%M'),'_',once(int(899*random()))))` |
| `producer_name` | `if(${producer_code_select}!='other', coalesce(${producer_name_corrected}, ${producer_name_pull}), ${producer_name_new} )` |
| `producer_code_other_producer` | `concat(${project_id},'_',${planting_wave},'_',${interviewer},'_',${producer_name},'_',${random_producer_number})` |
| `producer_code` | `if(${producer_code_select}!='other', ${producer_code_select}, ${producer_code_other_producer})` |
| `producer_organization` | `if(${producer_code_select}!='other', coalesce(${producer_organization_corrected}, ${producer_organization_pull}), ${p...` |
| `producer_interventions` | `if(${producer_code_select}!='other', ${producer_interventions_pull}, ${producer_interventions_new} )` |
| `sum_farm_prereg_yn_count` | `sum(${farm_prereg_yn_count})` |
| `out_farm_prereg_yn_count` | `if(${sum_farm_prereg_yn_count}<=1,1,sum(${farm_prereg_yn_count}))` |
| `nb_farms_total` | `pulldata('pulldata_producer_stm', 'nb_farms_total', 'producer_code', ${producer_code_select})` |
| `registered_farms` | `join(  ' ' , ${farm_code})` |
| `farm_producer_name` | `${producer_name}` |
| `farm_producer_code` | `${producer_code}` |
| `farm_nb` | `position(..)` |
| `nb_farm` | `if(selected(${farm_relevant_yn},'yes'),1,0)` |
| `farm_prereg_yn` | `if(${producer_code_select}='other' or ${prereg_delivery}='delivery', 'no' , 'yes')` |
| `farm_prereg_yn_count` | `if(${farm_prereg_yn} != 'no', 0, 1)` |
| `farm_nb_other` | `if( ${producer_code_select}= 'other' , 0, ${nb_farms_total})+${out_farm_prereg_yn_count}` |
| `farm_code_new` | `once(concat(${producer_code},'_f', ${farm_nb_other}))` |
| `farm_code_prereg` | `pulldata('pulldata_farm_stm', 'farm_code','farm_id',${farm_id_select})` |
| `farm_label_nb` | `substr(${farm_code}, (string-length(${farm_code})-2), string-length(${farm_code}))` |
| `farm_label` | `concat(${producer_organization},'\|',${farm_location_level_2},'\|',${producer_name},if(${farm_legal_type}='yes',${farm_...` |
| `farm_name_pull` | `pulldata('pulldata_farm_stm','farm_legal_name','farm_code',${farm_id_select})` |
| `farm_membership_id_pull` | `pulldata('pulldata_farm_stm','membership_id','farm_code',${farm_id_select})` |
| `farm_other_crop_1` | `selected-at(${farm_other_crop}, 0)` |
| `farm_other_crop_label_1` | `jr:choice-name( selected-at(${farm_other_crop}, 0), '${farm_other_crop}')` |
| `farm_other_crop_2` | `selected-at(${farm_other_crop}, 1)` |
| `farm_other_crop_label_2` | `jr:choice-name( selected-at(${farm_other_crop}, 1), '${farm_other_crop}')` |
| `farm_other_crop_3` | `selected-at(${farm_other_crop}, 2)` |
| `farm_other_crop_label_3` | `jr:choice-name( selected-at(${farm_other_crop}, 2), '${farm_other_crop}')` |
| `farm_other_crop_4` | `selected-at(${farm_other_crop}, 3)` |
| `farm_other_crop_label_4` | `jr:choice-name( selected-at(${farm_other_crop}, 3), '${farm_other_crop}')` |
| `farm_other_crop_5` | `selected-at(${farm_other_crop}, 4)` |
| `farm_other_crop_label_5` | `jr:choice-name( selected-at(${farm_other_crop}, 4), '${farm_other_crop}')` |
| `farm_other_crop_total` | `coalesce(${farm_other_crop_area_1},0) + coalesce(${farm_other_crop_area_2},0)  + coalesce(${farm_other_crop_area_3},0...` |
| `supply_chain_mb_file_yn` | `"yes"` |
| `supply_chain_mb_name_pull` | `coalesce( pulldata('supply_chain_member','supply_chain_mb_name','name',${supply_chain_mb_select}), pulldata('pulldata...` |
| `supply_chain_mb_cluster_pull` | `coalesce( pulldata('supply_chain_member','supply_chain_mb_cluster','name',${supply_chain_mb_select}), pulldata('pulld...` |
| `supply_chain_mb_subcluster_pull` | `coalesce( pulldata('supply_chain_member','supply_chain_mb_subcluster','name',${supply_chain_mb_select}),  pulldata('p...` |
| `supply_chain_mb_category_pull` | `coalesce( pulldata('supply_chain_member','supply_chain_mb_category','name',${supply_chain_mb_select}),  pulldata('pul...` |
| `supply_chain_mb_id_pull` | `coalesce( pulldata('supply_chain_member','supply_chain_mb_id','name',${supply_chain_mb_select}),  pulldata('pulldata_...` |
| `supply_chain_mb_photo_pull` | `pulldata('pulldata_farm_preregistry','supply_chain_mb_photo','farm_id',${farm_id_select})` |
| `supply_chain_relation_with_producer_pull` | `pulldata('pulldata_farm_preregistry','supply_chain_relation_with_producer','farm_id',${farm_id_select})` |
| `supply_chain_relation_with_producer_other_pull` | `pulldata('pulldata_farm_preregistry','supply_chain_relation_with_producer_other','farm_id',${farm_id_select})` |
| `supply_chain_mb_name` | `coalesce(${supply_chain_mb_name_pull}, ${supply_chain_mb_name_other})` |
| `supply_chain_mb_cluster` | `if(${supply_chain_mb_file_yn}='yes',${supply_chain_mb_cluster_mb_file_pull},${supply_chain_mb_cluster_farm_pull})` |
| `supply_chain_mb_subcluster` | `if(${supply_chain_mb_file_yn}='yes',${supply_chain_mb_subcluster_mb_file_pull},${supply_chain_mb_subcluster_farm_pull})` |
| `supply_chain_mb_category` | `if(${supply_chain_mb_file_yn}='yes',${supply_chain_mb_category_mb_file_pull},${supply_chain_mb_category_farm_pull})` |
| `supply_chain_mb_id` | `if(${supply_chain_mb_file_yn}='yes',${supply_chain_mb_id_mb_file_pull},${supply_chain_mb_id_farm_pull})` |
| `farm_certification_pull` | `pulldata('pulldata_farm_preregistry','farm_certification_pull','farm_id',${farm_id_select})` |
| `farm_relevant_hint` | `"A farm is elegible when: ** Add citeria by each project **
Ex. The farm is part of AAA program; The Farm is certifie...` |
| `sum_parcel_prereg_yn_count` | `sum(${parcel_prereg_yn_count})` |
| `out_parcel_prereg_yn_count` | `if(${sum_parcel_prereg_yn_count}<=1,1,sum(${parcel_prereg_yn_count}))` |
| `nb_parcels_total` | `pulldata('pulldata_farm_stm', 'nb_parcels_total', 'producer_code', ${producer_code_select})` |
| `registered_parcels` | `join(  ' ' , ${parcel_code})` |
| `parcel_producer_name` | `${producer_name}` |
| `parcel_producer_code` | `${producer_code}` |
| `parcel_farm_name` | `${farm_legal_name}` |
| `parcel_farm_code` | `${farm_code}` |
| `parcel_nb` | `position(..)` |
| `nb_parcel` | `if(selected(${parcel_relevant_yn},'yes') or ${parcel_id_select}!='other',1,0)` |
| `parcel_nb_other` | `if( ${producer_code_select}= 'other' , 0, ${nb_parcels_total})+${out_parcel_prereg_yn_count}` |
| `parcel_code_prereg` | `pulldata('pulldata_parcel_stm','parcel_code','parcel_code',${parcel_id_select})` |
| `parcel_prereg_yn` | `if(${parcel_id_select}='other' or ${prereg_delivery}='delivery', 'no' , 'yes')` |
| `parcel_prereg_yn_count` | `if(${parcel_prereg_yn} != 'no', 0, 1)` |
| `parcel_code_new` | `once(concat(${producer_code},'_p', ${parcel_nb_other}))` |
| `parcel_interventions` | `if(${parcel_id_select}!='other', ${parcel_interventions_pull}, ${parcel_interventions_new} )` |
| `parcel_sampling_yn_pull` | `pulldata('pulldata_parcel_stm','parcel_sampling_yn','parcel_code',${parcel_id_select})` |
| `planted_trees_hint_yn_pull` | `pulldata('pulldata_parcel_stm','planted_trees_hint_yn','parcel_code',${parcel_id_select})` |
| `parcel_label_nb` | `substr(${parcel_code}, (string-length(${parcel_code})-2), string-length(${parcel_code}))` |
| `parcel_label` | `concat(${producer_organization},'\|',${farm_location_level_2},'\|',${producer_name},'\|P',${parcel_label_nb})` |
| `species_1_nb_planted_trees_registry` | `coalesce(pulldata('pulldata_producer_stm', 'species_1_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_2_nb_planted_trees_registry` | `coalesce(pulldata('pulldata_producer_stm', 'species_2_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_3_nb_planted_trees_registry` | `coalesce(pulldata('pulldata_producer_stm', 'species_3_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_4_nb_planted_trees_registry` | `coalesce(pulldata('pulldata_producer_stm', 'species_4_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_5_nb_planted_trees_registry` | `coalesce(pulldata('pulldata_producer_stm', 'species_5_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `fallows_years_min` | `5` |
| `parcel_preload_geometry_pull` | `pulldata('pulldata_parcel_stm','gps','parcel_code',${parcel_id_select})` |
| `area_preload` | `round(area(${geoshape_preload}) div 10000 div ${local_area_unit_conv} ,4)` |
| `area_manual` | `round(area(${geoshape_manual}) div 10000 div ${local_area_unit_conv} ,4)` |
| `area_parcel` | `coalesce(${area_preload},${area_manual})` |
| `sum_intervention_prereg_yn_count` | `0` |
| `out_intervention_prereg_yn_count` | `0` |
| `nb_interventions_total` | `pulldata('pulldata_parcel_stm','nb_interventions','parcel_code',${parcel_id_select})` |
| `registered_interventions_filter` | `join(', ', ${intervention_type_select})` |
| `intervention_type_pull` | `pulldata('pulldata_intervention_stm','intervention_type','parcel_code',${parcel_id_select})` |
| `oa_prereg_input` | `pulldata('pulldata_intervention_stm','prereg_input_type','parcel_code',${parcel_id_select})` |
| `oa_prereg_stages` | `pulldata('pulldata_intervention_stm','prereg_development_stages','parcel_code',${parcel_id_select})` |
| `oa_prereg_dose` | `pulldata('pulldata_intervention_stm','prereg_dose_total','parcel_code',${parcel_id_select})` |
| `oa_y2_adjusted_area_ha` | `round(area(${oa_y2_adjusted_boundary}) div 10000, 4)` |
| `oa_y2_adjusted_area_mu` | `round(area(${oa_y2_adjusted_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `oa_y2_new_area_gps_ha` | `round(area(${oa_y2_new_area_boundary}) div 10000, 4)` |
| `oa_y2_new_area_gps_mu` | `round(area(${oa_y2_new_area_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `oa_y2_new_parcel_area_ha` | `round(${oa_y2_new_parcel_area_mu} * ${local_area_unit_conv}, 4)` |
| `oa_y2_new_parcel_gps_ha` | `round(area(${oa_y2_new_parcel_boundary}) div 10000, 4)` |
| `oa_y2_new_parcel_gps_mu` | `round(area(${oa_y2_new_parcel_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `four_r_prereg_baseline_source` | `pulldata('pulldata_intervention_stm','prereg_4r_baseline_source','parcel_code',${parcel_id_select})` |
| `four_r_prereg_baseline_rate` | `pulldata('pulldata_intervention_stm','prereg_4r_baseline_rate','parcel_code',${parcel_id_select})` |
| `four_r_prereg_baseline_time` | `pulldata('pulldata_intervention_stm','prereg_4r_baseline_time','parcel_code',${parcel_id_select})` |
| `four_r_prereg_baseline_place` | `pulldata('pulldata_intervention_stm','prereg_4r_baseline_place','parcel_code',${parcel_id_select})` |
| `four_r_source_improved` | `if(int(substr(${four_r_y1_source}, string-length(${four_r_y1_source}), 1)) > int(substr(${four_r_baseline_source}, st...` |
| `four_r_rate_improved` | `if(int(substr(${four_r_y1_rate}, string-length(${four_r_y1_rate}), 1)) > int(substr(${four_r_baseline_rate}, string-l...` |
| `four_r_time_improved` | `if(int(substr(${four_r_y1_time}, string-length(${four_r_y1_time}), 1)) > int(substr(${four_r_baseline_time}, string-l...` |
| `four_r_place_improved` | `if(int(substr(${four_r_y1_place}, string-length(${four_r_y1_place}), 1)) > int(substr(${four_r_baseline_place}, strin...` |
| `four_r_total_improvements` | `${four_r_source_improved} + ${four_r_rate_improved} + ${four_r_time_improved} + ${four_r_place_improved}` |
| `four_r_source_maintained` | `if(int(substr(${four_r_y2_source}, string-length(${four_r_y2_source}), 1)) >= int(substr(${four_r_y1_source}, string-...` |
| `four_r_rate_maintained` | `if(int(substr(${four_r_y2_rate}, string-length(${four_r_y2_rate}), 1)) >= int(substr(${four_r_y1_rate}, string-length...` |
| `four_r_time_maintained` | `if(int(substr(${four_r_y2_time}, string-length(${four_r_y2_time}), 1)) >= int(substr(${four_r_y1_time}, string-length...` |
| `four_r_place_maintained` | `if(int(substr(${four_r_y2_place}, string-length(${four_r_y2_place}), 1)) >= int(substr(${four_r_y1_place}, string-len...` |
| `four_r_total_maintained` | `${four_r_source_maintained} + ${four_r_rate_maintained} + ${four_r_time_maintained} + ${four_r_place_maintained}` |
| `four_r_y2_adjusted_area_ha` | `round(area(${four_r_y2_adjusted_boundary}) div 10000, 4)` |
| `four_r_y2_adjusted_area_mu` | `round(area(${four_r_y2_adjusted_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `four_r_y2_new_area_gps_ha` | `round(area(${four_r_y2_new_area_boundary}) div 10000, 4)` |
| `four_r_y2_new_area_gps_mu` | `round(area(${four_r_y2_new_area_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `four_r_y2_new_parcel_area_ha` | `round(${four_r_y2_new_parcel_area_mu} * ${local_area_unit_conv}, 4)` |
| `four_r_y2_new_parcel_gps_ha` | `round(area(${four_r_y2_new_parcel_boundary}) div 10000, 4)` |
| `four_r_y2_new_parcel_gps_mu` | `round(area(${four_r_y2_new_parcel_boundary}) div 10000 div ${local_area_unit_conv}, 4)` |
| `four_r_diff_source_maintained` | `if(int(substr(${four_r_y2_diff_source}, string-length(${four_r_y2_diff_source}), 1)) >= int(substr(${four_r_baseline_...` |
| `four_r_diff_rate_maintained` | `if(int(substr(${four_r_y2_diff_rate}, string-length(${four_r_y2_diff_rate}), 1)) >= int(substr(${four_r_baseline_rate...` |
| `four_r_diff_time_maintained` | `if(int(substr(${four_r_y2_diff_time}, string-length(${four_r_y2_diff_time}), 1)) >= int(substr(${four_r_baseline_time...` |
| `four_r_diff_place_maintained` | `if(int(substr(${four_r_y2_diff_place}, string-length(${four_r_y2_diff_place}), 1)) >= int(substr(${four_r_baseline_pl...` |
| `four_r_diff_total_maintained` | `${four_r_diff_source_maintained} + ${four_r_diff_rate_maintained} + ${four_r_diff_time_maintained} + ${four_r_diff_pl...` |
| `registered_interventions_from_prereg` | `0` |
| `not_registered_interventions_from_prereg` | `${nb_parcels_total}-${registered_interventions_from_prereg}` |
| `parcel_nb_interventions` | `coalesce( count(${intervention}), 0)` |
| `parcel_nb_validated_interventions` | `0` |
| `parcel_nb_not_validated_interventions` | `0` |
| `parcel_nb_validated_count` | `if(${parcel_nb_validated_interventions}>=1,1,0)` |
| `parcel_nb_not_validated_count` | `if(${parcel_nb_not_validated_interventions}>=1,1,0)` |
| `parcel_area_prereg` | `${area_parcel}` |
| `parcel_area_stm` | `0` |
| `validated_parcel_area_stm` | `0` |
| `species_1_nb_of_trees_living_out_parcel` | `0` |
| `species_2_nb_of_trees_living_out_parcel` | `0` |
| `species_3_nb_of_trees_living_out_parcel` | `0` |
| `species_4_nb_of_trees_living_out_parcel` | `0` |
| `species_5_nb_of_trees_living_out_parcel` | `0` |
| `parcel_total_nb_of_trees_living_out` | `coalesce(${species_1_nb_of_trees_living_out_parcel},0) + coalesce(${species_2_nb_of_trees_living_out_parcel},0) + coa...` |
| `species_1_selected` | `0` |
| `species_2_selected` | `0` |
| `species_3_selected` | `0` |
| `species_4_selected` | `0` |
| `species_5_selected` | `0` |
| `nb_species_selected` | `coalesce(${species_1_selected},0) + coalesce(${species_2_selected},0) + coalesce(${species_3_selected},0) + coalesce(...` |
| `total_immature_trees_out_parcel` | `0` |
| `total_trees_too_tall_out_parcel` | `0` |
| `total_trees_stressed_out_parcel` | `0` |
| `total_trees_unhealthy_out_parcel` | `0` |
| `parcel_percentage_ha_validated` | `round((${validated_parcel_area_stm} div ${parcel_area_prereg}) *100,2)` |
| `species_1_nb_of_trees_living_out_farm` | `if(sum(${species_1_nb_of_trees_living_out_parcel}) !='', sum(${species_1_nb_of_trees_living_out_parcel}), 0)` |
| `species_2_nb_of_trees_living_out_farm` | `if(sum(${species_2_nb_of_trees_living_out_parcel}) !='', sum(${species_2_nb_of_trees_living_out_parcel}), 0)` |
| `species_3_nb_of_trees_living_out_farm` | `if(sum(${species_3_nb_of_trees_living_out_parcel}) !='', sum(${species_3_nb_of_trees_living_out_parcel}), 0)` |
| `species_4_nb_of_trees_living_out_farm` | `if(sum(${species_4_nb_of_trees_living_out_parcel}) !='', sum(${species_4_nb_of_trees_living_out_parcel}), 0)` |
| `species_5_nb_of_trees_living_out_farm` | `if(sum(${species_5_nb_of_trees_living_out_parcel}) !='', sum(${species_5_nb_of_trees_living_out_parcel}), 0)` |
| `farm_total_nb_of_trees_out` | `coalesce(${species_1_nb_of_trees_living_out_farm}, 0) + coalesce(${species_2_nb_of_trees_living_out_farm}, 0) + coale...` |
| `farm_count` | `coalesce(count(${farm}), 0)` |
| `farm_relevant_count` | `sum(${nb_farm})` |
| `species_1_nb_of_trees_out` | `if(sum(${species_1_nb_of_trees_living_out_farm}) !='', sum(${species_1_nb_of_trees_living_out_farm}), 0)` |
| `species_2_nb_of_trees_out` | `if(sum(${species_2_nb_of_trees_living_out_farm}) !='', sum(${species_2_nb_of_trees_living_out_farm}), 0)` |
| `species_3_nb_of_trees_out` | `if(sum(${species_3_nb_of_trees_living_out_farm}) !='', sum(${species_3_nb_of_trees_living_out_farm}), 0)` |
| `species_4_nb_of_trees_out` | `if(sum(${species_4_nb_of_trees_living_out_farm}) !='', sum(${species_4_nb_of_trees_living_out_farm}), 0)` |
| `species_5_nb_of_trees_out` | `if(sum(${species_5_nb_of_trees_living_out_farm}) !='', sum(${species_5_nb_of_trees_living_out_farm}), 0)` |
| `total_nb_of_trees_out` | `coalesce(${species_1_nb_of_trees_out}, 0) + coalesce(${species_2_nb_of_trees_out}, 0) + coalesce(${species_3_nb_of_tr...` |
| `producer_nb_validated_parcels` | `coalesce( sum(${parcel_nb_validated_count}), 0)` |
| `producer_nb_not_validated_parcels` | `coalesce( sum(${parcel_nb_not_validated_count}), 0)` |
| `producer_area_prereg` | `coalesce( sum(${parcel_area_prereg}), 0)` |
| `producer_area_stm` | `coalesce( sum(${parcel_area_stm}), 0)` |
| `producer_validated_area_stm` | `coalesce( sum(${validated_parcel_area_stm}), 0)` |
| `sum_immature_trees_out_parcel` | `sum(${total_immature_trees_out_parcel})` |
| `sum_trees_too_tall_out_parcel` | `sum(${total_trees_too_tall_out_parcel})` |
| `sum_trees_stressed_out_parcel` | `sum(${total_trees_stressed_out_parcel})` |
| `sum_unhealthy_trees_out_parcel` | `sum(${total_trees_unhealthy_out_parcel})` |
| `nb_prereg_trees` | `pulldata('pulldata_producer_stm','nb_trees_prereg','producer_code',${producer_code_select})` |
| `percentage_ha_validated` | `round((${producer_validated_area_stm} div ${producer_area_prereg}) *100,2)` |
| `percentage_trees_planted` | `round((${total_nb_of_trees_out} div ${nb_trees_planted_pull}) *100,2)` |
| `species_1_nb_planted_trees_recap` | `coalesce(pulldata('pulldata_producer_stm', 'species_1_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_2_nb_planted_trees_recap` | `coalesce(pulldata('pulldata_producer_stm', 'species_2_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_3_nb_planted_trees_recap` | `coalesce(pulldata('pulldata_producer_stm', 'species_3_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_4_nb_planted_trees_recap` | `coalesce(pulldata('pulldata_producer_stm', 'species_4_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `species_5_nb_planted_trees_recap` | `coalesce(pulldata('pulldata_producer_stm', 'species_5_nb_trees_planted', 'producer_code', ${producer_code_select}), 0)` |
| `living_vs_planted_ratio` | `${nb_trees_planted_pull}-${total_nb_of_trees_out}` |
| `producer_left_project_reasons` | `"producer_left_project"` |
| `percentage_immature_trees` | `round((${sum_immature_trees_out_parcel} div ${nb_trees_delivered_pull}) * 100,1)` |
| `percentage_trees_too_tall` | `round((${sum_trees_too_tall_out_parcel} div ${nb_trees_delivered_pull}) * 100,1)` |
| `percentage_trees_stressed` | `round((${sum_trees_stressed_out_parcel} div ${nb_trees_delivered_pull}) * 100,1)` |
| `percentage_trees_unhealthy` | `round((${sum_unhealthy_trees_out_parcel} div ${nb_trees_delivered_pull}) * 100,1)` |

## 8. Required Fields

| Name | Type | Label (EN) | Required Condition |
|------|------|------------|-------------------|
| `subproject_id` | select_one subproject | Select a sub project | True |
| `interviewer` | select_one interviewer | Name of interviewer | True |
| `producer_present_yn` | select_one yes_no | Is the person interviewed the producer? | True |
| `representative_first_names` | text | First name of the representative | True |
| `representative_last_name` | text | Last name name of the representative | True |
| `relation_with_producer` | select_one relation | What is his/her relation with the producer? | True |
| `relation_with_producer_other` | text | What is his/her relation with the producer? (Other) | True |
| `representative_procuration_yn` | select_one yes_no | Is there a procuration that entitles the person interview... | True |
| `representative_procuration_photo` | image | Take a picture of the procuration | True |
| `producer_filter` | select_one producer_filter | Producer filter method | True |
| `producer_identity_card_nb_select` | text | Select the producer ID number | True |
| `location_select` | select_one location_level_1 | Select the location | True |
| `producer_organization_select` | select_one producer_organization | Select the organization/cooperative/association | True |
| `subproject_id_select` | select_one subproject | Select the subproject | True |
| `producer_code_select` | select_one_from_file producer_name.csv | Select the producer | True |
| `info_to_correct_yn` | select_one yes_no | Do you need to correct any of the producer's information? | True |
| `info_to_correct` | select_multiple data_correction | Please choose the information that need to be corrected | True |
| `producer_first_name_corrected` | text | Correct the information - Producer's first name | True |
| `producer_last_name_corrected` | text | Correct the information - Producer's last name | True |
| `producer_name_corrected` | calculate | Correct the information - Producer's name | True |
| `producer_identity_card_type_corrected` | select_one id_type | Correct the information - Select the ID type | True |
| `producer_identity_card_nb_corrected` | text | Correct the information - ID number | True |
| `producer_identity_card_picture_corrected` | image | Correct the information - Take a picture of the producer'... | True |
| `producer_phone_number_corrected` | text | Correct the information - Phone number | True |
| `producer_email_corrected` | text | Correct the information - Email address | True |
| `producer_gender_corrected` | select_one producer_gender | Correct the information - Gender | True |
| `producer_birth_date_corrected` | date | Correct the information - Birth date | True |
| `producer_age_corrected` | integer | Correct the information - Age | True |
| `producer_organization_corrected` | select_one producer_organization | Correct the information - Producer organization/cooperati... | True |
| `producer_picture_corrected` | image | Correct the information - Producer picture | True |
| `local_area_unit_corrected` | select_one area_unit | Correct the information - Local area unit | True |
| `total_area_land_owned_corrected` | decimal | Correct the information - Total area of land owned / cult... | True |
| `producer_mb_id_corrected` | text | Correct the information - Producer supply chain ID | True |
| `location_level_1_corrected` | select_one location_level_1 | Correct the information - Location Level 1 | True |
| `location_level_2_corrected` | select_one location_level_2 | Correct the information - Location Level 2 | True |
| `location_level_3_corrected` | select_one location_level_3 | Correct the information - Location Level 3 | True |
| `location_level_4_corrected` | text | Correct the information - Location Level 4 | True |
| `producer_consent_personal` | select_one gdpr | I expressly accept the terms of this Consent Form. | True |
| `producer_type_new` | select_one producer_type | Is the producer an individual person or an association? | True |
| `producer_association_name_new` | text | Association / Community group name | True |
| `producer_association_identification_type_new` | select_one id_type | Select the association ID type | True |
| `producer_association_identification_nb_new` | text | Association ID number | True |
| `producer_first_names_new` | text | producer first name | True |
| `producer_last_name_new` | text | producer last name | True |
| `producer_identity_card_type_new` | select_one id_type | Select the ID type | True |
| `producer_identity_card_nb_new` | text | ID number | True |
| `producer_gender_new` | select_one producer_gender | Gender | True |
| `producer_phone_number_new` | text | Phone number | True |
| `producer_picture_new` | image | producer picture | True |
| `producer_phone_number_anonymized` | text | Phone number | True |
| `producer_organization_new` | select_one producer_organization | What organisation is the producer part of? | True |
| `producer_organization_other_new` | text | What organisation is the producer part of? (Other) | True |
| `local_area_unit_new` | select_one area_unit | Choose the appropriate area unit | True |
| `total_area_land_owned_new` | decimal | Total area of land owned (${local_area_unit_new}) | True |
| `producer_interventions_new` | select_multiple intervention | Select interventions available for this producer | True |
| `producer_participation_activities` | select_multiple activities | Did the producer participate in the following mandatory p... | True |
| `producer_relevant_yn` | select_one yes_no | Is the producer eligible? | True |
| `stm_confirmation` | select_one confirmation_statement | Do you want to conduct STM for this producer? | yes |
| `farm_id_select` | select_one_from_file farm.csv | Select the farm you are at | yes |
| `farm_code` | text | Farm code: | yes |
| `farm_info_correction_yn` | select_one yes_no | Do you need to correct any farm information? | yes |
| `farm_info_to_correct` | select_multiple farm_info_corrected | Select the variables that need to be corrected | yes |
| `farm_location_level_1` | select_one location_level_1 | Farm location - Level 1 | True |
| `farm_location_level_2` | select_one location_level_2 | Farm location - Level 2 | True |
| `farm_location_level_3` | select_one location_level_3 | Farm location - Level 3 | True |
| `farm_legal_type` | select_one yes_no | Is the farm registered as a company? | True |
| `farm_legal_name` | text | Legal name of the company | True |
| `farm_identification_type` | select_one id_type | Select ID type | True |
| `farm_identification_nb` | text | Farm legal ID number | True |
| `farm_main_crop` | select_one detailed_agricultural_land_cover | What is the main commodity of the farm? | True |
| `farm_main_crop_other` | text | What is the main commodity of the farm? (other) | True |
| `farm_other_crop` | select_multiple detailed_agricultural_land_cover | What are other commodities produced on the farm? | True |
| `producer_supply_chain_program_yn` | select_one yes_no | Is this farm part of any supply chain sustainability prog... | True |
| `supply_chain_mb_select` | select_one_from_file supply_chain_member.csv | Select the person registered in the program | True |
| `supply_chain_mb_name_yn` | select_one yes_no | Is the producer the person directly registered in the pro... | True |
| `supply_chain_mb_name_other` | text | Name of the person registered in the program | True |
| `supply_chain_mb_name` | calculate | Name of the person registered in the program | True |
| `supply_chain_relation_with_producer` | select_one relation | What is the producer relation with the person registered? | True |
| `supply_chain_relation_with_producer_other` | text | What is the producer relation with the person registered?... | True |
| `supply_chain_mb_id_mb_file_pull` | text | Membership ID number | True |
| `supply_chain_mb_id_farm_pull` | text | Membership ID number | True |
| `farm_relevant_yn` | select_one yes_no | Is the farm eligible? | True |
| `parcel_prereg_yn` | calculate | parcel_prereg_yn | yes |
| `parcel_code` | text | Parcel code | yes |
| `parcel_interventions_new` | select_multiple intervention | Available intervention for this parcel | True |
| `minimim_trees_reminder` | select_one yes_no | Remember, the minimum number of trees to create a new par... | yes |
| `parcel_sampling_yn_pull` | calculate | parcel_sampling_yn_pull | yes |
| `planted_trees_hint_yn_pull` | calculate | parcel_sampling_yn_pull | yes |
| `short_term_monitoring_date` | date | Short Term Monitoring date | yes |
| `geopoint_parcel` | geopoint | Record GPS point | True |
| `parcel_location_level_4` | hidden | Parcel location - Level 4 | True |
| `producer_plan_cut_trees_yn` | select_one yes_no | Is the producer planning to cut trees in this parcel to r... | True |
| `producer_plan_cut_trees_reason` | select_multiple reason_to_cut | producer reason to cut the trees | True |
| `parcel_nb_trees_want_to_cut` | integer | How many trees do you plan to cut? | True |
| `parcel_relevant_yn` | select_one yes_no | Is the parcel relevant for monitoring ? | True |
| `parcel_not_relevant_explanation` | select_multiple not_relevant | Why is the parcel not elegible for monitoring ? | True |
| `parcel_gps_method` | select_one parcel_gps_method | How do you want to register the area of this parcel | True |
| `parcel_preload_select` | hidden | Select the parcel you want to preload | True |
| `geoshape_preload` | geoshape | Preload the boundaries of this parcel | True |
| `geoshape_manual` | geoshape | Record the boundaries of this parcel | True |
| `intervention_type_select` | select_one intervention_type | Select intervention type | yes |
| `stm_year_select` | select_one stm_year | Which STM are you conducting? | yes |
| `intervention_realized_yn` | select_one yes_no | Has the intervention been realized to some extent? | yes |
| `oa_input_type_applied` | select_multiple type_input | OA.2: Type of input applied | yes |
| `oa_development_stage` | select_multiple development_stage | OA.3: Select development stage(s) | yes |
| `oa_application_date` | date | OA.4: Application date | yes |
| `oa_dose_applied` | decimal | OA.5: Applied dose (kg/mu) | yes |
| `oa_validation` | select_one yes_no | OA.11: Validate intervention implementation? | yes |
| `oa_same_area_y2` | select_one yes_no | OA.12: Same area as STM y+1? | yes |
| `oa_area_scenario` | select_one area_scenario | OA.13: What happened? | yes |
| `oa_y2_new_area_size_mu` | decimal | Area size (mu) | yes |
| `oa_y2_new_parcel_name` | text | Parcel name / identifier | yes |
| `oa_y2_new_parcel_area_mu` | decimal | Total parcel area (mu) | yes |
| `oa_y2_input_type_applied` | select_multiple type_input | OA.2 (Y+2): Type of input applied | yes |
| `oa_y2_development_stage` | select_multiple development_stage | OA.3 (Y+2): Select development stage(s) | yes |
| `oa_y2_application_date` | date | OA.4 (Y+2): Application date | yes |
| `oa_y2_dose_applied` | decimal | OA.5 (Y+2): Applied dose (kg/mu) | yes |
| `oa_y2_validation` | select_one yes_no | OA.11 (Y+2): Validate? | yes |
| `four_r_baselined_yn` | select_one yes_no | 4R.2: Has farmer been baselined for 4R? | yes |
| `four_r_baseline_now` | select_one yes_no | 4R.3: Baseline farmer now? | yes |
| `four_r_baseline_evidence` | image | 4R.4: Baseline assessment evidence | yes |
| `four_r_baseline_source` | select_one 4r_level | Right SOURCE baseline level | yes |
| `four_r_baseline_rate` | select_one 4r_level | Right RATE baseline level | yes |
| `four_r_baseline_time` | select_one 4r_level | Right TIME baseline level | yes |
| `four_r_baseline_place` | select_one 4r_level | Right PLACE baseline level | yes |
| `four_r_y1_source` | select_one 4r_level | Right SOURCE y+1 level | yes |
| `four_r_y1_rate` | select_one 4r_level | Right RATE y+1 level | yes |
| `four_r_y1_time` | select_one 4r_level | Right TIME y+1 level | yes |
| `four_r_y1_place` | select_one 4r_level | Right PLACE y+1 level | yes |
| `four_r_y1_evidence` | image | 4R.7: Y+1 assessment evidence | yes |
| `four_r_y1_validation` | select_one yes_no | 4R.11: Validate intervention? | yes |
| `four_r_same_area_y2` | select_one yes_no | 4R.12: Same area as y+1? | yes |
| `four_r_y2_source` | select_one 4r_level | 4R.13: Right SOURCE y+2 level | yes |
| `four_r_y2_rate` | select_one 4r_level | 4R.13: Right RATE y+2 level | yes |
| `four_r_y2_time` | select_one 4r_level | 4R.13: Right TIME y+2 level | yes |
| `four_r_y2_place` | select_one 4r_level | 4R.13: Right PLACE y+2 level | yes |
| `four_r_y2_evidence` | image | 4R.14: Y+2 evidence | yes |
| `four_r_area_scenario` | select_one area_scenario | 4R.18: What happened? | yes |
| `four_r_y2_new_area_size_mu` | decimal | Area size (mu) | yes |
| `four_r_y2_new_parcel_name` | text | Parcel name / identifier | yes |
| `four_r_y2_new_parcel_area_mu` | decimal | Total parcel area (mu) | yes |
| `four_r_y2_diff_source` | select_one 4r_level | 4R.13 (diff area): Right SOURCE y+2 level | yes |
| `four_r_y2_diff_rate` | select_one 4r_level | 4R.13 (diff area): Right RATE y+2 level | yes |
| `four_r_y2_diff_time` | select_one 4r_level | 4R.13 (diff area): Right TIME y+2 level | yes |
| `four_r_y2_diff_place` | select_one 4r_level | 4R.13 (diff area): Right PLACE y+2 level | yes |
| `four_r_y2_diff_evidence` | image | 4R.14 (diff area): Y+2 evidence | yes |
| `four_r_y2_validation` | select_one yes_no | 4R.11 (Y+2): Validate? | yes |
| `parcel_total_nb_interventions_warning` | note | <span style="color:red">🛑** A elegible parcel must have a... | True |
| `parcel_risk_level` | hidden | Select the risk level for this parcel | True |
| `planted_vs_distributed_difference_reasons` | select_multiple reasons_difference | What are the reasons of tree loss between the Planting Re... | True |
| `producer_made_planting_error_reasons` | select_multiple producer_made_planting_error_reasons | Specify the reasons related to the producer making a plan... | True |
| `planted_vs_distributed_positive_difference_reasons` | select_multiple reasons_difference_positive | What are the reasons for gap between the Planting Registr... | True |
| `producer_leaving_reasons` | select_multiple producer_leaving_reasons | Why has the producer left the project? | True |
| `priority_level` | hidden | Select the priority level to assist the producer based on... | True |
| `recommendarion_picture_yes_no` | hidden | Did the producer receive a sheet with the recommendations? | True |
| `recommendation_picture` | hidden | Please, take a picture of the recommendation sheet | True |

## 9. CSV File Mapping

### farm.csv

**Columns (5):** `name`, `label::English (en)`, `label::French (fr)`, `producer_id`, `filter`

| name | label::English (en) | label::French (fr) | producer_id | filter |
| --- | --- | --- | --- | --- |
| other | New farm | 新增农场 | -1 | other |
| project_id_w25_peng_yue_xf_... | juye\|xf b\|F1 | juye\|xf b\|F1 | project_id_w25_peng_yue_xf_... | project_id_w25_peng_yue_xf_... |
| project_id_w25_peng_yue_建军_... | juye\|建军 赵\|F1 | juye\|建军 赵\|F1 | project_id_w25_peng_yue_建军_... | project_id_w25_peng_yue_建军_... |

### geometry.csv

**Columns (3):** `name`, `label`, `geometry`

| name | label | geometry |
| --- | --- | --- |
| project_id_w25_peng_yue_xf_... | juye\|xf b\|P1 | 25.0761795 102.6718365 0.0 ... |
| project_id_w25_peng_yue_建军_... | juye\|建军 赵\|P1 | 35.26450685754843 116.17569... |
| project_id_w25_peng_yue_承安_... | juye\|承安 黄\|P1 | 35.1976300149945 116.131673... |

### parcel.csv

**Columns (5):** `name`, `label::English (en)`, `label::French (fr)`, `farm_id`, `filter`

| name | label::English (en) | label::French (fr) | farm_id | filter |
| --- | --- | --- | --- | --- |
| other | New parcel | 新增地块 | -1 | other |
| project_id_w25_peng_yue_xf_... | juye\|xf b\|P1 | juye\|xf b\|P1 | project_id_w25_peng_yue_xf_... | project_id_w25_peng_yue_xf_... |
| project_id_w25_peng_yue_建军_... | juye\|建军 赵\|P1 | juye\|建军 赵\|P1 | project_id_w25_peng_yue_建军_... | project_id_w25_peng_yue_建军_... |

### producer_name.csv

**Columns (7):** `name`, `label::English (en)`, `label::French (fr)`, `farm_location_level_1`, `subprojectid`, `organization`, `identification_nb`

| name | label::English (en) | label::French (fr) | farm_location_level_1 | subprojectid | organization | identification_nb |
| --- | --- | --- | --- | --- | --- | --- |
| other | New producer | 新增生产者 | other | other | other | other |
| project_id_w25_peng_yue_xf_... | xf b-509734541 | xf b-509734541 | heze | cn_garlic_stm | other | 509734541 |
| project_id_w25_peng_yue_建军_... | 建军 赵-550281012 | 建军 赵-550281012 | heze | cn_garlic_stm | other | 550281012 |

### pulldata_farm_preregistry.csv

**Columns (32):** `farm_id`, `farm_code`, `producer_id`, `producer_code`, `farm_legal_name`, `producer_name`, `membership_id`, `farm_main_crop`, `nb_parcels_total`, `farm_location_level_1`, `farm_location_level_2`, `farm_location_level_3`, `farm_address`, `farm_legal_type`, `farm_identification_type`, `farm_identification_nb`, `farm_identification_nb_other`, `farm_certification_pull`, `total_area_main_crop`, `farm_other_crop_area_1`, `farm_other_crop_area_2`, `farm_other_crop_area_3`, `farm_other_crop_area_4`, `farm_other_crop_area_5`, `supply_chain_mb_name`, `supply_chain_mb_cluster`, `supply_chain_mb_subcluster`, `supply_chain_mb_category`, `supply_chain_mb_id`, `supply_chain_mb_photo`, `supply_chain_relation_with_producer`, `supply_chain_relation_with_producer_other`

| farm_id | farm_code | producer_id | producer_code | farm_legal_name | producer_name | membership_id | farm_main_crop | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project_id_w25_peng_yue_xf_... | project_id_w25_peng_yue_xf_... | 509734541 | project_id_w25_peng_yue_xf_... | xf b 农场 | xf b |  | garlic | ... |
| project_id_w25_peng_yue_建军_... | project_id_w25_peng_yue_建军_... | 550281012 | project_id_w25_peng_yue_建军_... | 建军 赵 农场 | 建军 赵 |  | garlic | ... |
| project_id_w25_peng_yue_承安_... | project_id_w25_peng_yue_承安_... | 680514860 | project_id_w25_peng_yue_承安_... | 承安 黄 农场 | 承安 黄 |  | garlic | ... |

### pulldata_farm_stm.csv

**Columns (32):** `farm_id`, `farm_code`, `producer_id`, `producer_code`, `farm_legal_name`, `producer_name`, `membership_id`, `farm_main_crop`, `nb_parcels_total`, `farm_location_level_1`, `farm_location_level_2`, `farm_location_level_3`, `farm_address`, `farm_legal_type`, `farm_identification_type`, `farm_identification_nb`, `farm_identification_nb_other`, `farm_certification`, `total_area_main_crop`, `farm_other_crop_area_1`, `farm_other_crop_area_2`, `farm_other_crop_area_3`, `farm_other_crop_area_4`, `farm_other_crop_area_5`, `supply_chain_mb_name`, `supply_chain_mb_cluster`, `supply_chain_mb_subcluster`, `supply_chain_mb_category`, `supply_chain_mb_id`, `supply_chain_mb_photo`, `supply_chain_relation_with_producer`, `supply_chain_relation_with_producer_other`

| farm_id | farm_code | producer_id | producer_code | farm_legal_name | producer_name | membership_id | farm_main_crop | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| project_id_w25_peng_yue_xf_... | project_id_w25_peng_yue_xf_... | 509734541 | project_id_w25_peng_yue_xf_... | xf b 农场 | xf b |  | garlic | ... |
| project_id_w25_peng_yue_建军_... | project_id_w25_peng_yue_建军_... | 550281012 | project_id_w25_peng_yue_建军_... | 建军 赵 农场 | 建军 赵 |  | garlic | ... |
| project_id_w25_peng_yue_承安_... | project_id_w25_peng_yue_承安_... | 680514860 | project_id_w25_peng_yue_承安_... | 承安 黄 农场 | 承安 黄 |  | garlic | ... |

### pulldata_intervention_stm.csv

**Columns (56):** `id_intervention`, `intervention_code`, `parcel_code`, `id_parcel`, `intervention`, `planting_model`, `specific_planting_model`, `gps`, `nb_rows`, `tree_spacing`, `alleycrop_width`, `planting_density`, `main_reason_to_plant`, `reasons_to_plant`, `risks_for_tree_survival`, `intervention_planted_area`, `gps_intervention`, `species_1_nb_trees_planted`, `species_2_nb_trees_planted`, `species_3_nb_trees_planted`, `species_4_nb_trees_planted`, `species_5_nb_trees_planted`, `sowing_start_date`, `sowing_end_date`, `sowing_method`, `destruction_start_date`, `destruction_end_date`, `destruction_method`, `vicia_faba_density`, `phacelia_tenacetifolia_density`, `vicia_sativa_density`, `sinapis_alba_density`, `fagopyrum_esculentum_density`, `lens_nigricans_density`, `brassica_carinata_d_abyssinie_density`, `linum_usitatissimum_density`, `trigonella_foenum_graecum_density`, `trifolium_incarnatum_density`, `raphanus_sativus_density`, `eruca_sativa_density`, `trifolium_alexandrinum_density`, `setaria_italica_density`, `guizotia_abyssinica_density`, `helianthus_annuus_density`, `intervention_type`, `prereg_input_type`, `prereg_development_stages`, `prereg_date_start`, `prereg_date_end`, `prereg_dose_total`, `prereg_application_tool`, `prereg_4r_baseline_source`, `prereg_4r_baseline_rate`, `prereg_4r_baseline_time`, `prereg_4r_baseline_place`, `wave_code`

| id_intervention | intervention_code | parcel_code | id_parcel | intervention | planting_model | specific_planting_model | gps | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | project_id_w25_peng_yue_xf_... | project_id_w25_peng_yue_xf_... |  | regenerative_agriculture |  |  | yes | ... |
| 2 | project_id_w25_peng_yue_建军_... | project_id_w25_peng_yue_建军_... |  | regenerative_agriculture |  |  | yes | ... |
| 3 | project_id_w25_peng_yue_承安_... | project_id_w25_peng_yue_承安_... |  | regenerative_agriculture |  |  | yes | ... |

### pulldata_parcel_stm.csv

**Columns (14):** `id_producer`, `id_parcel`, `producer`, `parcel_code`, `parcel_label`, `farm_code`, `parcel_number`, `parcel_planted_area`, `nb_interventions`, `planted_trees_hint_yn`, `parcel_sampling_yn`, `parcel_interventions`, `intervention_planted_area`, `gps`

| id_producer | id_parcel | producer | parcel_code | parcel_label | farm_code | parcel_number | parcel_planted_area | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 509734541 | 1 | xf b | project_id_w25_peng_yue_xf_... | juye\|xf b\|P1 | project_id_w25_peng_yue_xf_... | P1 | 18.0966 | ... |
| 550281012 | 2 | 建军 赵 | project_id_w25_peng_yue_建军_... | juye\|建军 赵\|P1 | project_id_w25_peng_yue_建军_... | P1 | 5.2108 | ... |
| 680514860 | 3 | 承安 黄 | project_id_w25_peng_yue_承安_... | juye\|承安 黄\|P1 | project_id_w25_peng_yue_承安_... | P1 | 3.9434 | ... |

### pulldata_producer_stm.csv

**Columns (48):** `id_producer`, `producer_code`, `producer_name`, `producer_name_and_id`, `producer_organization`, `producer_id`, `subproject_id`, `subproject_name`, `producer_gender`, `producer_age`, `producer_birth_date`, `local_area_unit`, `total_area_land_owned`, `nb_farms_total`, `producer_phone_number`, `location_level_1`, `location_level_2`, `location_level_3`, `location_level_4`, `prereg_delivery`, `producer_id_type`, `producer_phone_number_other`, `email_address`, `nb_parcels_preregistred`, `nb_parcels_planted`, `total_nb_parcels`, `nb_sample_parcels`, `nb_trees_prereg`, `nb_trees_delivered`, `nb_trees_planted`, `producer_planted_rate`, `delivery_date`, `wave_code`, `species_planted`, `species_1_nb_trees_delivered`, `species_2_nb_trees_delivered`, `species_3_nb_trees_delivered`, `species_4_nb_trees_delivered`, `species_5_nb_trees_delivered`, `producer_picture`, `producer_id_picture`, `producer_interventions`, `producer_mb_id`, `species_1_nb_trees_planted`, `species_2_nb_trees_planted`, `species_3_nb_trees_planted`, `species_4_nb_trees_planted`, `species_5_nb_trees_planted`

| id_producer | producer_code | producer_name | producer_name_and_id | producer_organization | producer_id | subproject_id | subproject_name | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 509734541 | project_id_w25_peng_yue_xf_... | xf b | xf b-509734541 |  | 509734541 |  | China Garlic | ... |
| 550281012 | project_id_w25_peng_yue_建军_... | 建军 赵 | 建军 赵-550281012 |  | 550281012 |  | China Garlic | ... |
| 680514860 | project_id_w25_peng_yue_承安_... | 承安 黄 | 承安 黄-680514860 |  | 680514860 |  | China Garlic | ... |

### supply_chain_member.csv

**Columns (14):** `list_name`, `name`, `label`, `member_name`, `member_cluster`, `member_subcluster`, `member_category`, `member_id`, `member_photo`, `supply_chain_mb_name`, `supply_chain_mb_cluster`, `supply_chain_mb_subcluster`, `supply_chain_mb_category`, `supply_chain_mb_id`

| list_name | name | label | member_name | member_cluster | member_subcluster | member_category | member_id | ... |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| supply_chain_member | jinxiang_garlic_coop | 金乡大蒜合作社 Jinxiang Garlic Coo... | 金乡大蒜合作社 | shandong_garlic | jinxiang_south | cooperative | SC001 | ... |
| supply_chain_member | lunan_agri_trade | 鲁南农贸公司 Lunan Agri Trade | 鲁南农贸公司 | shandong_garlic | jinxiang_north | buyer | SC002 | ... |
| supply_chain_member | cangshan_garlic_assoc | 苍山大蒜协会 Cangshan Garlic Asso... | 苍山大蒜协会 | shandong_garlic | cangshan | cooperative | SC003 | ... |

## 10. Test Scenario: Complete Valid Form Submission

This scenario uses the first producer in the pulldata CSVs: **xf b** (ID: 509734541).

### Step-by-step answers:

| Step | Field | Answer | Rationale |
|------|-------|--------|-----------|
| 1 | `interviewer` | `tech_wang` (Wang Jian) | First available interviewer |
| 2 | `subproject` | `cn_garlic_stm` | Only subproject available |
| 3 | `gdpr_consent` / `gdpr_personal` | `gdpr_personal_yes` | Required consent to proceed |
| 4 | `planting_wave` | Select available wave (e.g., W25) | Matches pulldata wave_code |
| 5 | `producer_name` / producer select | `project_id_w25_peng_yue_xf_b_0727_235` | First producer in CSV |
| 6 | `farm` select | `project_id_w25_peng_yue_xf_b_0727_235_f1` | Only farm for this producer |
| 7 | `parcel` select | `project_id_w25_peng_yue_xf_b_0727_235_p1` | Only parcel for this farm |
| 8 | Any yes/no questions | `yes` | Ensures relevance conditions pass for deeper sections |
| 9 | `priority_level` (if shown) | `low` | Simplest path |
| 10 | Intervention fields | Accept pulldata defaults from `pulldata_intervention_stm.csv` | Auto-populated via pulldata |
| 11 | Any numeric inputs | Enter valid positive numbers within constraints | Check constraint messages |
| 12 | Any date inputs | Use today's date or dates within valid range | Ensure date constraints pass |
| 13 | GPS/location | Allow device GPS or enter manual coords | Required for geo fields |
| 14 | Photo fields | Capture or skip if not required | Check required flag |

### Key relevance paths to watch:

| Trigger Variable | Controls N fields | Example dependents |
|-----------------|-------------------|-------------------|
| `info_to_correct` | 26 | `prereg_corrected_information_note`, `producer_first_name_corrected`, `producer_last_name_corrected`, `producer_name_corrected` ... +22 more |
| `parcel_interventions` | 18 | `minimim_trees_reminder`, `planted_trees_hint_yn`, `planted_date_pull_registry`, `planted_trees_reminder_registry` ... +14 more |
| `detailed_land_use` | 15 | `nb_years_land_considered_fallows`, `nb_years_land_considered_fallows`, `nb_years_land_considered_fallows`, `nb_years_land_considered_fallows_warning` ... +11 more |
| `producer_interventions` | 14 | `producer_total_nb_validated_parcels_note`, `producer_total_nb_not_validated_parcels_note`, `producer_area_prereg_note`, `producer_area_stm_note` ... +10 more |
| `farm_other_crop` | 12 | `farm_other_crop_note`, `farm_other_crop_note`, `farm_other_crop_area_1`, `farm_other_crop_area_1` ... +8 more |
| `supply_chain_mb_file_yn` | 10 | `supply_chain_mb_select`, `supply_chain_mb_name_other`, `supply_chain_mb_cluster_mb_file_pull`, `supply_chain_mb_subcluster_mb_file_pull` ... +6 more |
| `farm_id_select` | 9 | `farm_code_prereg`, `farm_name_pull`, `farm_membership_id_pull`, `farm_name_pull_note` ... +5 more |
| `parcel_gps_method` | 9 | `parcel_checking`, `parcel_preload_select`, `track_note`, `geoshape_preload` ... +5 more |
| `intervention_type_select` | 9 | `oa_section`, `oa_prereg_input`, `oa_prereg_stages`, `oa_prereg_dose` ... +5 more |
| `parcel_id_select` | 8 | `parcel_code_prereg`, `parcel_interventions_pull`, `parcel_interventions_new`, `minimim_trees_reminder` ... +4 more |
| `producer_code_select` | 7 | `producer_information_registered`, `producer_consent`, `producer_information_new`, `producer_elegibility` ... +3 more |
| `producer_present_yn` | 6 | `producer_representative_information`, `producer_consent`, `note_consent_1`, `note_consent_representative` ... +2 more |
| `stm_confirmation` | 6 | `registered_farms`, `registered_farms`, `short_term_monitoring`, `short_term_monitoring` ... +2 more |
| `legal_document_access_yn` | 6 | `legal_document_authorization_yn`, `legal_document_producer_name_yn`, `legal_document_person_name`, `legal_document_relation` ... +2 more |
| `oa_area_scenario` | 6 | `oa_reason_same_area_diff_boundaries`, `oa_reason_new_area`, `oa_reason_different_parcel`, `oa_y2_gps_adjust` ... +2 more |

### Recommended test values for key trigger fields:

- **`form_status`** = `standard_dev` (set by calculate, shows test warning)
- **`registry_type`** = `short_term_monitoring` (set by calculate)
- **`prereg_delivery`** = pulled from producer CSV (value: `preregistry`)
- For select_one yes/no fields: answer `yes` to reveal maximum sections
- For select_multiple fields: select all options to test all conditional groups
- Ensure GPS is available for geopoint/geoshape fields

---
*Report generated from Draft_Regag_Garlic_UPDATED.xlsx analysis*