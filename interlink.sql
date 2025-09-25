-- phpMyAdmin SQL Dump
-- version 4.0.10.20
-- https://www.phpmyadmin.net
--
-- โฮสต์: localhost
-- เวลาในการสร้าง: 
-- เวอร์ชั่นของเซิร์ฟเวอร์: 5.1.73-community
-- รุ่นของ PHP: 5.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- ฐานข้อมูล: `interlink`
--

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `agent_register`
--

CREATE TABLE IF NOT EXISTS `agent_register` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name_th` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `company` varchar(255) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `image` varchar(100) DEFAULT NULL,
  `dbd` varchar(100) DEFAULT NULL,
  `dbd_type` varchar(10) DEFAULT NULL,
  `tax20` varchar(100) DEFAULT NULL,
  `tax20_type` varchar(10) DEFAULT NULL,
  `status` int(1) DEFAULT NULL COMMENT '0.no approve 1.aprove 9.delete',
  `type` int(11) NOT NULL COMMENT '1. web 2.app',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `approve` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=219 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `analytics`
--

CREATE TABLE IF NOT EXISTS `analytics` (
  `analytics_id` int(1) NOT NULL,
  `analytics_text` text NOT NULL,
  PRIMARY KEY (`analytics_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `annual`
--

CREATE TABLE IF NOT EXISTS `annual` (
  `annual_id` int(11) NOT NULL AUTO_INCREMENT,
  `annual_name` varchar(150) NOT NULL,
  `annual_file` varchar(255) NOT NULL,
  `annual_sort` int(2) NOT NULL DEFAULT '0',
  `annual_active` int(1) NOT NULL DEFAULT '1',
  `annual_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`annual_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `award`
--

CREATE TABLE IF NOT EXISTS `award` (
  `award_id` int(11) NOT NULL AUTO_INCREMENT,
  `award_year` varchar(50) NOT NULL,
  `award_file` varchar(200) NOT NULL,
  `award_title` text NOT NULL,
  `award_detail` mediumtext NOT NULL,
  `award_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`award_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='รางวัล' AUTO_INCREMENT=37 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `banner`
--

CREATE TABLE IF NOT EXISTS `banner` (
  `banner_id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) DEFAULT NULL,
  `banner_file` varchar(255) DEFAULT NULL,
  `banner_link` varchar(255) DEFAULT NULL,
  `banner_sort` int(2) DEFAULT NULL,
  `banner_status` int(1) DEFAULT NULL,
  `users_action` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`banner_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=88 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `budget`
--

CREATE TABLE IF NOT EXISTS `budget` (
  `budget_id` int(11) NOT NULL AUTO_INCREMENT,
  `budget_type` int(11) NOT NULL COMMENT '1.งบการเงิน 2.คำอธิบายและการวิเคราะห์ผลการดำเนินงาน 3. ข้อมูลสำคัญทางการเงิน',
  `budget_name` varchar(100) NOT NULL,
  `budget_year` varchar(4) NOT NULL,
  `budget_file` varchar(255) NOT NULL,
  `budget_sort` int(2) NOT NULL DEFAULT '0',
  `budget_active` int(1) NOT NULL DEFAULT '1',
  `budget_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`budget_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `budget_type`
--

CREATE TABLE IF NOT EXISTS `budget_type` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `type_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`type_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `calendar`
--

CREATE TABLE IF NOT EXISTS `calendar` (
  `calendar_id` int(11) NOT NULL AUTO_INCREMENT,
  `calendar_title` varchar(255) NOT NULL,
  `calendar_short` varchar(255) NOT NULL,
  `calendar_detail` longtext,
  `calendar_date` date NOT NULL,
  `calendar_active` int(1) NOT NULL DEFAULT '1',
  `calendar_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`calendar_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `carries`
--

CREATE TABLE IF NOT EXISTS `carries` (
  `carries_id` int(11) NOT NULL AUTO_INCREMENT,
  `carries_picture` varchar(200) NOT NULL,
  `carries_public` int(1) DEFAULT '1',
  `carries_status` int(1) DEFAULT '1',
  `users_action` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`carries_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=58 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `catalog`
--

CREATE TABLE IF NOT EXISTS `catalog` (
  `catalog_id` int(11) NOT NULL AUTO_INCREMENT,
  `catalog_name` varchar(100) NOT NULL,
  `catalog_picture` varchar(100) NOT NULL,
  `catalog_file` varchar(100) NOT NULL,
  `catalog_active` int(1) NOT NULL DEFAULT '1',
  `catalog_sort` int(3) NOT NULL DEFAULT '0',
  `catalog_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`catalog_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=39 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(200) NOT NULL,
  `category_number` int(1) NOT NULL,
  `category_keyword` text,
  `category_title` text,
  `category_description` text,
  `category_color` varchar(7) DEFAULT NULL,
  `category_picture` varchar(200) DEFAULT NULL,
  `category_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`category_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='หมวดหมู่สินค้า' AUTO_INCREMENT=15 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `category_test`
--

CREATE TABLE IF NOT EXISTS `category_test` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(200) NOT NULL,
  `category_number` int(1) NOT NULL,
  `category_keyword` text,
  `category_title` text,
  `category_description` text,
  `category_color` varchar(7) DEFAULT NULL,
  `category_picture` varchar(200) DEFAULT NULL,
  `category_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`category_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='หมวดหมู่สินค้า' AUTO_INCREMENT=13 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `complaint`
--

CREATE TABLE IF NOT EXISTS `complaint` (
  `complaint_id` int(11) NOT NULL AUTO_INCREMENT,
  `complaint_name` varchar(200) NOT NULL,
  `complaint_company` varchar(200) NOT NULL,
  `complaint_mobile` varchar(13) NOT NULL,
  `complaint_email` varchar(100) NOT NULL,
  `complaint_title` varchar(200) NOT NULL,
  `complaint_detail` longtext NOT NULL,
  `complaint_status` int(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`complaint_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=16441 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `contact`
--

CREATE TABLE IF NOT EXISTS `contact` (
  `contact_id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_location` text NOT NULL,
  `contact_address` text NOT NULL,
  `contact_open` varchar(255) DEFAULT NULL,
  `contact_mobile` varchar(255) DEFAULT NULL,
  `contact_fax` varchar(255) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_note` text NOT NULL,
  `contact_file` varchar(150) DEFAULT NULL,
  `contact_map` text,
  `contact_latitude` varchar(50) DEFAULT NULL,
  `contact_longitude` varchar(50) DEFAULT NULL,
  `contact_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`contact_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `corrupt`
--

CREATE TABLE IF NOT EXISTS `corrupt` (
  `corrupt_id` int(11) NOT NULL AUTO_INCREMENT,
  `corrupt_name` varchar(244) NOT NULL,
  `corrupt_mobile` varchar(20) NOT NULL,
  `corrupt_email` varchar(100) NOT NULL,
  `corrupt_address` text NOT NULL,
  `corrupt_title` varchar(255) NOT NULL,
  `corrupt_detail` text NOT NULL,
  `corrupt_file` varchar(200) NOT NULL,
  `corrupt_status` int(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`corrupt_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `dealer`
--

CREATE TABLE IF NOT EXISTS `dealer` (
  `dealer_id` int(11) NOT NULL AUTO_INCREMENT,
  `dealer_nameth` varchar(255) NOT NULL,
  `dealer_nameen` varchar(200) NOT NULL,
  `dealer_company` varchar(255) NOT NULL,
  `dealer_address` varchar(255) NOT NULL,
  `dealer_mobile` varchar(10) NOT NULL,
  `dealer_email` varchar(100) NOT NULL,
  `dealer_image` varchar(100) DEFAULT NULL,
  `dealer_dbd` varchar(100) DEFAULT NULL,
  `dealer_dbdtype` varchar(10) DEFAULT NULL,
  `dealer_tax20` varchar(100) DEFAULT NULL,
  `dealer_tax20type` varchar(10) DEFAULT NULL,
  `type_id` int(11) NOT NULL DEFAULT '0' COMMENT 'table dealer_type',
  `dealer_status` int(1) DEFAULT '1',
  `users_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`dealer_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=115 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `dealer_type`
--

CREATE TABLE IF NOT EXISTS `dealer_type` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `type_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`type_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `design`
--

CREATE TABLE IF NOT EXISTS `design` (
  `design_id` int(11) NOT NULL AUTO_INCREMENT,
  `design_name` varchar(255) NOT NULL,
  `design_picture` varchar(150) NOT NULL,
  `design_file` varchar(150) NOT NULL,
  `design_sort` int(2) NOT NULL DEFAULT '0',
  `design_active` int(1) NOT NULL DEFAULT '1',
  `design_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`design_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='แบบ56-1' AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `development`
--

CREATE TABLE IF NOT EXISTS `development` (
  `development_id` int(11) NOT NULL AUTO_INCREMENT,
  `development_year` varchar(4) NOT NULL,
  `development_detail` text NOT NULL,
  `development_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`development_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='พัฒนาการสำคัญของบริษัท' AUTO_INCREMENT=14 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `diploma`
--

CREATE TABLE IF NOT EXISTS `diploma` (
  `diploma_id` int(11) NOT NULL AUTO_INCREMENT,
  `diploma_file` varchar(200) NOT NULL,
  `diploma_title` text NOT NULL,
  `diploma_detail` mediumtext NOT NULL,
  `diploma_date` date NOT NULL,
  `diploma_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`diploma_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='ประกาศนียบัตร' AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `discountpercentage_clearance_tb`
--

CREATE TABLE IF NOT EXISTS `discountpercentage_clearance_tb` (
  `dcp_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_discount` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT 'admin',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`dcp_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=227 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `discountpercentage_tb`
--

CREATE TABLE IF NOT EXISTS `discountpercentage_tb` (
  `dcp_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_discount` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT 'admin',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`dcp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `distributor`
--

CREATE TABLE IF NOT EXISTS `distributor` (
  `distributor_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_id` int(11) NOT NULL,
  `distributor_status` int(1) NOT NULL COMMENT '1.ขอเป็นตัวแทนจำหน่าย 2. ยืนยัน 0. ยกเลิก',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`distributor_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=44 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `download`
--

CREATE TABLE IF NOT EXISTS `download` (
  `download_id` int(11) NOT NULL AUTO_INCREMENT,
  `download_name` varchar(100) NOT NULL,
  `download_picture` varchar(100) NOT NULL,
  `download_file` varchar(100) NOT NULL,
  `download_active` int(1) NOT NULL DEFAULT '1',
  `download_sort` int(3) DEFAULT '0',
  `download_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`download_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=13 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `ebook`
--

CREATE TABLE IF NOT EXISTS `ebook` (
  `ebook_id` int(11) NOT NULL AUTO_INCREMENT,
  `ebook_type` int(1) NOT NULL,
  `ebook_typename` varchar(50) NOT NULL,
  `ebook_ref` int(11) NOT NULL,
  `ebook_picture` varchar(200) NOT NULL,
  `ebook_active` int(1) NOT NULL,
  `ebook_sort` int(3) NOT NULL,
  `ebook_status` int(1) NOT NULL,
  `users_action` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`ebook_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=807 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `forgot`
--

CREATE TABLE IF NOT EXISTS `forgot` (
  `forgot_id` int(11) NOT NULL AUTO_INCREMENT,
  `forgot_code` varchar(100) NOT NULL,
  `forgot_plan` varchar(100) NOT NULL,
  `users_id` int(11) NOT NULL,
  `dealer_email` varchar(100) NOT NULL,
  `forgot_status` int(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`forgot_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=194 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `geographies`
--

CREATE TABLE IF NOT EXISTS `geographies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_bin NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='InnoDB free: 8192 kB';

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `group`
--

CREATE TABLE IF NOT EXISTS `group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(100) NOT NULL,
  `group_status` int(1) NOT NULL DEFAULT '1',
  `group_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`group_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `investor`
--

CREATE TABLE IF NOT EXISTS `investor` (
  `investor_id` int(11) NOT NULL AUTO_INCREMENT,
  `investor_name` varchar(255) NOT NULL,
  `investor_contact` varchar(255) NOT NULL,
  `investor_mobile` varchar(15) NOT NULL,
  `investor_email` varchar(255) NOT NULL,
  `investor_file` varchar(255) NOT NULL,
  `investor_active` int(1) NOT NULL DEFAULT '1',
  `investor_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`investor_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `investor_contact`
--

CREATE TABLE IF NOT EXISTS `investor_contact` (
  `contact_id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_name` text NOT NULL,
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`contact_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `investor_document`
--

CREATE TABLE IF NOT EXISTS `investor_document` (
  `document_id` int(11) NOT NULL AUTO_INCREMENT,
  `investor_id` int(11) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_date` date NOT NULL,
  `document_file` varchar(255) NOT NULL,
  `document_active` int(1) NOT NULL DEFAULT '1',
  `document_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`document_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `log_service`
--

CREATE TABLE IF NOT EXISTS `log_service` (
  `service_id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(15) NOT NULL,
  `service_name` text NOT NULL,
  `service_path` text NOT NULL,
  `service_method` varchar(4) NOT NULL,
  `service_message` longtext NOT NULL,
  `service_type` text NOT NULL,
  `service_value` text NOT NULL,
  `users_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`service_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=112287 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `magazine`
--

CREATE TABLE IF NOT EXISTS `magazine` (
  `magazine_id` int(11) NOT NULL AUTO_INCREMENT,
  `magazine_name` varchar(100) NOT NULL,
  `magazine_year` varchar(4) NOT NULL,
  `magazine_date` date NOT NULL,
  `magazine_picture` varchar(100) NOT NULL,
  `magazine_file` varchar(100) NOT NULL,
  `magazine_active` int(1) NOT NULL DEFAULT '1',
  `magazine_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`magazine_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=63 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `meeting`
--

CREATE TABLE IF NOT EXISTS `meeting` (
  `meeting_id` int(11) NOT NULL AUTO_INCREMENT,
  `meeting_nameshort` varchar(50) NOT NULL,
  `meeting_name` varchar(255) NOT NULL,
  `meeting_location` text NOT NULL,
  `meeting_datestart` date NOT NULL,
  `meeting_dateend` date NOT NULL,
  `meeting_timestart` time NOT NULL,
  `meeting_timeend` time NOT NULL,
  `province_id` int(2) NOT NULL,
  `geography_id` int(1) NOT NULL,
  `meeting_detail` longtext NOT NULL,
  `meeting_amount` int(3) NOT NULL,
  `meeting_color` varchar(10) NOT NULL,
  `meeting_active` int(1) NOT NULL DEFAULT '1',
  `meeting_active_register` int(1) NOT NULL DEFAULT '1' COMMENT '1. เปิดลงทะเบียน 0.ไม่เปิดลงทะเบียน',
  `meeting_highlight` int(1) DEFAULT '0',
  `meeting_picture` varchar(100) NOT NULL DEFAULT 'img/event.png',
  `meeting_location_type` int(1) DEFAULT '1' COMMENT '1.สถานที่ 2.ออนไลน์',
  `meeting_latitude` varchar(50) DEFAULT NULL,
  `meeting_longitude` varchar(50) DEFAULT NULL,
  `meeting_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `field_pattern_join` tinyint(1) DEFAULT '0',
  `field_name_en` tinyint(1) DEFAULT '0',
  `field_rank` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`meeting_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=747 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `meeting_register`
--

CREATE TABLE IF NOT EXISTS `meeting_register` (
  `register_id` int(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` int(11) NOT NULL,
  `register_prefix` int(1) DEFAULT NULL,
  `register_company` varchar(100) NOT NULL,
  `register_position` varchar(100) DEFAULT NULL,
  `register_name` varchar(100) NOT NULL,
  `register_nameen` varchar(100) NOT NULL,
  `register_mobile` varchar(13) NOT NULL,
  `register_email` varchar(150) NOT NULL,
  `register_address` varchar(250) DEFAULT NULL,
  `users_id` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `recive_news` varchar(255) DEFAULT NULL,
  `endorsed_by` varchar(255) DEFAULT NULL,
  `channel_register` varchar(255) DEFAULT NULL,
  `work_phone` varchar(13) DEFAULT NULL,
  `pattern_join_meeting` varchar(100) DEFAULT NULL,
  `rank` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `sub_districts` varchar(100) DEFAULT NULL,
  `districts` varchar(100) DEFAULT NULL,
  `provinces` varchar(100) DEFAULT NULL,
  `postal_codes` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`register_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=40558 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `member`
--

CREATE TABLE IF NOT EXISTS `member` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `member_name` varchar(255) NOT NULL,
  `member_company` varchar(255) NOT NULL,
  `member_mobile` varchar(10) NOT NULL,
  `member_image` varchar(100) DEFAULT NULL,
  `member_status` int(1) DEFAULT '1',
  `users_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`member_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=715 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `menu`
--

CREATE TABLE IF NOT EXISTS `menu` (
  `menu_id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`menu_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=17 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `message`
--

CREATE TABLE IF NOT EXISTS `message` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message_code` varchar(50) NOT NULL,
  `users_id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `message_read` int(1) NOT NULL DEFAULT '0',
  `message_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`message_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1614 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `migrations`
--

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `more_pictures`
--

CREATE TABLE IF NOT EXISTS `more_pictures` (
  `mp_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_picture` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT '',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`mp_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=551 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `more_pictures_clearance`
--

CREATE TABLE IF NOT EXISTS `more_pictures_clearance` (
  `mpc_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_picture` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT '',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`mpc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `more_pictures_test`
--

CREATE TABLE IF NOT EXISTS `more_pictures_test` (
  `mpt_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_picture` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT '',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT '',
  PRIMARY KEY (`mpt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `news`
--

CREATE TABLE IF NOT EXISTS `news` (
  `news_id` int(11) NOT NULL AUTO_INCREMENT,
  `news_title` varchar(255) NOT NULL,
  `news_titleshort` varchar(255) NOT NULL,
  `news_detail` text NOT NULL,
  `news_detailapp` longtext,
  `news_file` varchar(255) NOT NULL,
  `news_status` int(1) NOT NULL DEFAULT '1',
  `news_active` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`news_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=367 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `newsrelease`
--

CREATE TABLE IF NOT EXISTS `newsrelease` (
  `newsrelease_id` int(11) NOT NULL AUTO_INCREMENT,
  `newsrelease_name` varchar(255) NOT NULL,
  `newsrelease_date` date NOT NULL,
  `newsrelease_picture` varchar(255) NOT NULL,
  `newsrelease_file` varchar(255) NOT NULL,
  `newsrelease_active` int(1) NOT NULL DEFAULT '1',
  `newsrelease_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`newsrelease_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=12 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `news_picture`
--

CREATE TABLE IF NOT EXISTS `news_picture` (
  `picture_id` int(11) NOT NULL AUTO_INCREMENT,
  `news_id` int(11) NOT NULL,
  `picture_file` varchar(255) NOT NULL,
  PRIMARY KEY (`picture_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1931 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `notification`
--

CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_title` varchar(100) NOT NULL,
  `notification_detail` text NOT NULL,
  `type_id` int(11) NOT NULL DEFAULT '9' COMMENT '0.all 1. dealer_type 9.system',
  `notification_active` int(1) NOT NULL DEFAULT '0',
  `notification_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`notification_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1566 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `part`
--

CREATE TABLE IF NOT EXISTS `part` (
  `part_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `part_name` varchar(200) NOT NULL,
  `part_picture` varchar(200) DEFAULT NULL,
  `part_color` varchar(7) DEFAULT NULL,
  `part_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`part_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=270 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `part_test`
--

CREATE TABLE IF NOT EXISTS `part_test` (
  `part_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `part_name` varchar(200) NOT NULL,
  `part_picture` text,
  `part_color` varchar(7) NOT NULL,
  `part_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`part_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=232 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `payment_redirects`
--

CREATE TABLE IF NOT EXISTS `payment_redirects` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_sale` varchar(100) DEFAULT NULL,
  `url_redirect` longtext,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `present`
--

CREATE TABLE IF NOT EXISTS `present` (
  `present_id` int(11) NOT NULL AUTO_INCREMENT,
  `present_name` varchar(255) NOT NULL,
  `present_date` date NOT NULL,
  `present_file` varchar(255) NOT NULL,
  `present_picture` varchar(255) NOT NULL,
  `present_link` varchar(100) NOT NULL,
  `present_active` int(1) NOT NULL DEFAULT '1',
  `present_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`present_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='เว็บแคสต์และการนำเสนอ' AUTO_INCREMENT=17 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `pressrelease`
--

CREATE TABLE IF NOT EXISTS `pressrelease` (
  `pressrelease_id` int(11) NOT NULL AUTO_INCREMENT,
  `pressrelease_name` varchar(255) NOT NULL,
  `pressrelease_date` date NOT NULL,
  `pressrelease_picture` varchar(255) NOT NULL,
  `pressrelease_file` varchar(255) NOT NULL,
  `pressrelease_active` int(1) NOT NULL DEFAULT '1',
  `pressrelease_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`pressrelease_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `producoptions_clearance_tb`
--

CREATE TABLE IF NOT EXISTS `producoptions_clearance_tb` (
  `pot_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_option` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT 'admin',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`pot_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=30 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `producoptions_tb`
--

CREATE TABLE IF NOT EXISTS `producoptions_tb` (
  `pot_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL DEFAULT '0',
  `product_option` text NOT NULL,
  `create_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_name` varchar(250) NOT NULL DEFAULT 'admin',
  `update_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `update_name` varchar(250) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`pot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `product`
--

CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT '0',
  `sub_id` int(11) DEFAULT '0',
  `part_id` int(11) DEFAULT '0',
  `product_name` varchar(255) DEFAULT NULL,
  `product_brand` varchar(255) DEFAULT NULL,
  `product_description` text,
  `product_picture` text,
  `product_sku` varchar(255) DEFAULT NULL,
  `product_file` text,
  `product_filename` varchar(255) DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `product_new` int(1) DEFAULT '0' COMMENT '0. no 1.yes',
  `product_best` int(1) DEFAULT '0' COMMENT '0. no 1. yes',
  `product_status` int(1) DEFAULT '1',
  `users_action` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `product_uom` varchar(10) DEFAULT NULL,
  `09` tinyint(1) NOT NULL DEFAULT '1',
  `clearanceSales` tinyint(1) DEFAULT '0',
  `clearanceQuantity` int(11) DEFAULT '0',
  `clearancePrice` decimal(10,2) DEFAULT NULL,
  `expo_status` tinyint(4) DEFAULT '0',
  `expo_price` decimal(10,2) DEFAULT '0.00',
  `cat5e` tinyint(4) DEFAULT '0',
  `cat6` tinyint(4) DEFAULT '0',
  `tool_tester` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4857 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `product_clearance`
--

CREATE TABLE IF NOT EXISTS `product_clearance` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT '0',
  `sub_id` int(11) DEFAULT '0',
  `part_id` int(11) DEFAULT '0',
  `product_name` varchar(255) DEFAULT NULL,
  `product_brand` varchar(255) DEFAULT NULL,
  `product_description` text,
  `product_picture` text,
  `product_sku` varchar(255) DEFAULT NULL,
  `product_file` text,
  `product_filename` varchar(255) DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `product_new` int(1) DEFAULT '0' COMMENT '0. no 1.yes',
  `product_best` int(1) DEFAULT '0' COMMENT '0. no 1. yes',
  `product_status` int(1) DEFAULT '1',
  `users_action` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `product_uom` varchar(10) DEFAULT NULL,
  `09` tinyint(1) NOT NULL DEFAULT '1',
  `clearanceSales` tinyint(1) DEFAULT '0',
  `clearanceQuantity` int(11) DEFAULT '0',
  `clearancePrice` decimal(10,2) DEFAULT NULL,
  `expo_status` tinyint(4) DEFAULT '0',
  `expo_price` decimal(10,2) DEFAULT '0.00',
  `cat5e` tinyint(4) DEFAULT '0',
  `cat6` tinyint(4) DEFAULT '0',
  `tool_tester` tinyint(4) DEFAULT '0',
  `13` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`product_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=227 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `product_test_upload`
--

CREATE TABLE IF NOT EXISTS `product_test_upload` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT '0',
  `sub_id` int(11) DEFAULT '0',
  `part_id` int(11) DEFAULT '0',
  `product_name` varchar(255) DEFAULT NULL,
  `product_brand` varchar(255) DEFAULT NULL,
  `product_description` text,
  `product_picture` text,
  `product_sku` varchar(255) DEFAULT NULL,
  `product_file` text,
  `product_filename` varchar(255) DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `product_new` int(1) DEFAULT '0' COMMENT '0. no 1.yes',
  `product_best` int(1) DEFAULT '0' COMMENT '0. no 1. yes',
  `product_status` int(1) DEFAULT '1',
  `users_action` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `product_uom` varchar(10) DEFAULT NULL,
  `09` tinyint(1) NOT NULL DEFAULT '1',
  `clearanceSales` tinyint(1) DEFAULT '0',
  `clearanceQuantity` int(11) DEFAULT '0',
  `clearancePrice` decimal(10,2) DEFAULT NULL,
  `expo_status` tinyint(4) DEFAULT '0',
  `expo_price` decimal(10,2) DEFAULT '0.00',
  `cat5e` tinyint(4) DEFAULT '0',
  `cat6` tinyint(4) DEFAULT '0',
  `tool_tester` tinyint(4) DEFAULT '0',
  `13` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`product_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=227 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `promote`
--

CREATE TABLE IF NOT EXISTS `promote` (
  `promote_id` int(11) NOT NULL,
  `promote_picture` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `promote_url` text COLLATE utf8_unicode_ci NOT NULL,
  `promote_sort` int(1) NOT NULL,
  `promote_status` int(1) NOT NULL,
  `users_action` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `provinces`
--

CREATE TABLE IF NOT EXISTS `provinces` (
  `id` int(5) NOT NULL,
  `code` varchar(2) COLLATE utf8_unicode_ci NOT NULL,
  `name_th` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `name_en` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `geography_id` int(5) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `qanda`
--

CREATE TABLE IF NOT EXISTS `qanda` (
  `qanda_id` int(11) NOT NULL AUTO_INCREMENT,
  `qanda_name` varchar(100) NOT NULL,
  `qanda_picture` varchar(100) NOT NULL,
  `qanda_file` varchar(100) NOT NULL,
  `qanda_active` int(1) NOT NULL DEFAULT '1',
  `qanda_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`qanda_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regional_branches`
--

CREATE TABLE IF NOT EXISTS `regional_branches` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `branch` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `region` varchar(150) CHARACTER SET utf8 DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=81 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regional_branches_old07082564`
--

CREATE TABLE IF NOT EXISTS `regional_branches_old07082564` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `branch` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=81 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regis_midyear`
--

CREATE TABLE IF NOT EXISTS `regis_midyear` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(150) NOT NULL,
  `tel` varchar(30) NOT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `province` varchar(100) NOT NULL,
  `status_regis` tinyint(4) NOT NULL,
  `time_regis` varchar(100) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `sale` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1152 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regis_roadshow`
--

CREATE TABLE IF NOT EXISTS `regis_roadshow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(150) NOT NULL,
  `tel` varchar(30) NOT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `status_regis` tinyint(4) NOT NULL DEFAULT '0',
  `time_regis` varchar(100) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `sale` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=895 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `seo`
--

CREATE TABLE IF NOT EXISTS `seo` (
  `seo_id` int(1) NOT NULL AUTO_INCREMENT,
  `seo_keyword` text NOT NULL,
  `seo_title` text NOT NULL,
  `seo_description` text NOT NULL,
  PRIMARY KEY (`seo_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `set`
--

CREATE TABLE IF NOT EXISTS `set` (
  `set_id` int(11) NOT NULL AUTO_INCREMENT,
  `set_name` varchar(150) NOT NULL,
  `set_date` date NOT NULL,
  `set_file` varchar(255) NOT NULL,
  `set_sort` int(2) NOT NULL DEFAULT '0',
  `set_active` int(1) NOT NULL DEFAULT '1',
  `set_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`set_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='รายงานต่อตลาดหลักทรัพย์' AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `setting`
--

CREATE TABLE IF NOT EXISTS `setting` (
  `setting_id` int(1) NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(50) NOT NULL,
  `setting_value` varchar(100) NOT NULL,
  PRIMARY KEY (`setting_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `shareholder`
--

CREATE TABLE IF NOT EXISTS `shareholder` (
  `shareholder_id` int(11) NOT NULL AUTO_INCREMENT,
  `shareholder_type` int(11) NOT NULL COMMENT '1.หนังสือประชุมสามัญผู้ถือหุ้น 2.รายงานการประชุมสามัญผู้ถือหุ้น 3.นโยบายจ่ายเงินปันผล',
  `shareholder_name` varchar(100) NOT NULL,
  `shareholder_file` varchar(255) NOT NULL,
  `shareholder_sort` int(2) NOT NULL DEFAULT '0',
  `shareholder_active` int(1) NOT NULL DEFAULT '1',
  `shareholder_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`shareholder_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `shareholder_actions`
--

CREATE TABLE IF NOT EXISTS `shareholder_actions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `shareholder_id` bigint(20) NOT NULL,
  `action` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `agenda` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `shareholder_lists`
--

CREATE TABLE IF NOT EXISTS `shareholder_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `shareholder_id` bigint(20) NOT NULL,
  `number_shares` bigint(20) NOT NULL,
  `title_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `give_proxy` tinyint(1) NOT NULL DEFAULT '0',
  `proxy` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status_login` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=55 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `shareholder_meetings`
--

CREATE TABLE IF NOT EXISTS `shareholder_meetings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `all_shares` bigint(20) NOT NULL DEFAULT '0',
  `shares_login` bigint(20) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status_login` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `shareholder_scores`
--

CREATE TABLE IF NOT EXISTS `shareholder_scores` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `agenda` int(11) NOT NULL,
  `approved` bigint(20) NOT NULL DEFAULT '0',
  `disapproved` bigint(20) NOT NULL DEFAULT '0',
  `abstained` bigint(20) NOT NULL DEFAULT '0',
  `voided_ballot` bigint(20) NOT NULL DEFAULT '0',
  `total` bigint(20) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `opening_time` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `closing_time` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `structure`
--

CREATE TABLE IF NOT EXISTS `structure` (
  `structure_id` int(1) NOT NULL AUTO_INCREMENT,
  `structure_file` varchar(200) NOT NULL,
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`structure_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='โครงสร้างบริษัท' AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `sub`
--

CREATE TABLE IF NOT EXISTS `sub` (
  `sub_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `sub_name` varchar(255) NOT NULL,
  `sub_keyword` text,
  `sub_title` text,
  `sub_description` text,
  `sub_picture` varchar(200) DEFAULT NULL,
  `sub_color` varchar(7) DEFAULT NULL,
  `sub_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sub_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=99 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `sub_test`
--

CREATE TABLE IF NOT EXISTS `sub_test` (
  `sub_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `sub_name` varchar(255) NOT NULL,
  `sub_keyword` text,
  `sub_title` text,
  `sub_description` text,
  `sub_picture` varchar(200) DEFAULT NULL,
  `sub_color` varchar(7) DEFAULT NULL,
  `sub_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`sub_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=98 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `tagmanager`
--

CREATE TABLE IF NOT EXISTS `tagmanager` (
  `tagmanager_id` int(1) NOT NULL,
  `tagmanager_header` text NOT NULL,
  `tagmanager_body` text NOT NULL,
  PRIMARY KEY (`tagmanager_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `trick`
--

CREATE TABLE IF NOT EXISTS `trick` (
  `trick_id` int(11) NOT NULL AUTO_INCREMENT,
  `trick_name` varchar(100) NOT NULL,
  `trick_picture` varchar(100) NOT NULL,
  `trick_link` text NOT NULL,
  `trick_sort` int(3) NOT NULL DEFAULT '0',
  `trick_active` int(1) NOT NULL DEFAULT '1',
  `trick_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`trick_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `users_id` int(11) NOT NULL AUTO_INCREMENT,
  `users_ref` varchar(100) DEFAULT NULL COMMENT 'เลขที่อ้างอิง facebook, apple, google+ id',
  `users_code` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `users_status` int(1) DEFAULT NULL COMMENT '0. ลบ 1.ปกติ',
  `users_permission` int(1) DEFAULT NULL,
  `users_type` int(1) DEFAULT NULL COMMENT '1.web, 2 Application',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `right` longtext COMMENT 'events',
  `right2` longtext COMMENT 'saminar',
  PRIMARY KEY (`users_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=145 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `vdo`
--

CREATE TABLE IF NOT EXISTS `vdo` (
  `vdo_id` int(11) NOT NULL AUTO_INCREMENT,
  `vdo_file` varchar(200) NOT NULL,
  `vdo_link` varchar(150) NOT NULL,
  `vdo_sort` int(2) NOT NULL,
  `vdo_status` int(1) NOT NULL,
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`vdo_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COMMENT='วีดีโอ' AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `video_retrospectives`
--

CREATE TABLE IF NOT EXISTS `video_retrospectives` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `data` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `warranty`
--

CREATE TABLE IF NOT EXISTS `warranty` (
  `warranty_id` int(11) NOT NULL AUTO_INCREMENT,
  `warranty_name` varchar(255) NOT NULL,
  `warranty_detail` varchar(255) NOT NULL,
  `warranty_picture` varchar(150) NOT NULL,
  `warranty_active` int(1) NOT NULL DEFAULT '1',
  `warranty_sort` int(2) NOT NULL,
  `warranty_status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`warranty_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=25 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `white_papers`
--

CREATE TABLE IF NOT EXISTS `white_papers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `picture` varchar(100) NOT NULL,
  `file` varchar(100) NOT NULL,
  `active` int(1) NOT NULL DEFAULT '1',
  `sort` int(3) NOT NULL DEFAULT '0',
  `status` int(1) NOT NULL DEFAULT '1',
  `users_action` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=43 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `white_paper_downloads`
--

CREATE TABLE IF NOT EXISTS `white_paper_downloads` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3353 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
