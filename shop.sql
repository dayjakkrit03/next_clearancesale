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
-- ฐานข้อมูล: `shop`
--

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `backup_customersilink_28012565`
--

CREATE TABLE IF NOT EXISTS `backup_customersilink_28012565` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `No_` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Name_2` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Address_2` varchar(255) DEFAULT NULL,
  `District` varchar(255) DEFAULT NULL,
  `Amphur` varchar(255) DEFAULT NULL,
  `County` varchar(255) DEFAULT NULL,
  `Contact` varchar(255) DEFAULT NULL,
  `PhoneNo_` varchar(255) DEFAULT NULL,
  `E-Mail` varchar(255) DEFAULT NULL,
  `VAT_Registration_No_` varchar(255) DEFAULT NULL,
  `Customer_Price_Group` varchar(255) DEFAULT NULL,
  `Salesperson_Code` varchar(255) DEFAULT NULL,
  `Salesperson_Name` varchar(255) DEFAULT NULL,
  `Blocked` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=30370 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `backup_interlinkid(invalid customer_id form clearance)`
--

CREATE TABLE IF NOT EXISTS `backup_interlinkid(invalid customer_id form clearance)` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `member_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address_company` text,
  `sale_event` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_username_unique` (`username`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=430 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `carts`
--

CREATE TABLE IF NOT EXISTS `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `product` varchar(255) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `price_amount` decimal(38,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cart_status` tinyint(4) DEFAULT '0' COMMENT '0:inCart, 1:pendingPay, 2:paySuccess, 3:cancle',
  `chrg_id` varchar(255) DEFAULT NULL,
  `check_product` tinyint(1) NOT NULL DEFAULT '0',
  `reserve` tinyint(4) NOT NULL DEFAULT '0',
  `event_sale` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carts_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2271 ;

--
-- ทริกเกอร์ `carts`
--
DROP TRIGGER IF EXISTS `combined_sales_triggers`;
DELIMITER //
CREATE TRIGGER `combined_sales_triggers` AFTER UPDATE ON `carts`
 FOR EACH ROW BEGIN
  DECLARE new_total_amount DECIMAL(38,2);
  DECLARE company_name_var VARCHAR(255);
  DECLARE customer_name_var VARCHAR(255);
  DECLARE telephone_var VARCHAR(255);
  DECLARE email_var VARCHAR(255);
  DECLARE customer_info_found INT;

-- Check for sales_detail_tb insert conditions
 IF NEW.event_sale = 'clearance-2024' AND NEW.cart_status = 2 THEN
  
  -- Retrieve entity information from customer_profile_entities
  SELECT entityCompanyName, entityCustomerName, entityTel, entityMail
  INTO company_name_var, customer_name_var, telephone_var, email_var
  FROM customer_profile_entities
  WHERE id__customer = NEW.id__customers;
      
  IF company_name_var IS NULL OR company_name_var = '' THEN
    SELECT personIdCard, personCompanyName, personTel, personMail
    INTO company_name_var, customer_name_var, telephone_var, email_var
    FROM customer_profile_people
    WHERE id__customer = NEW.id__customers;
  END IF;
  
  -- Check for sales_report_tb update conditions
  IF (NEW.event_sale = 'clearance-2024' OR NEW.event_sale = 'clearance-2024') AND NEW.cart_status = 2 THEN
    -- Check if there is matching data in sales_report_tb
    SELECT COUNT(*) INTO customer_info_found FROM sales_report_tb WHERE id__customers = NEW.id__customers;
    
    -- If matching data is found, retrieve customer information
    IF customer_info_found > 0 THEN
      SELECT total_amount INTO new_total_amount FROM sales_report_tb WHERE id__customers = NEW.id__customers;
      SET new_total_amount = NEW.price_amount + new_total_amount;
      
      -- Update the existing record in sales_report_tb
      UPDATE sales_report_tb
      SET total_amount = new_total_amount,
          company_name = company_name_var,
          customer_Name = customer_name_var,
          telephone = telephone_var,
          email = email_var,
          updated_at = NOW(),
          updated_by = 'combined_sales_triggers'
      WHERE id__customers = NEW.id__customers;
    ELSE
      SET new_total_amount = NEW.price_amount;
      
      -- Insert a new record into sales_report_tb
      INSERT INTO sales_report_tb (id__customers, total_amount, company_name, customer_Name, telephone, email, created_at, created_by)
      VALUES (NEW.id__customers, new_total_amount, company_name_var, customer_name_var, telephone_var, email_var, NOW(), 'combined_sales_triggers');
    END IF;
  END IF;

  -- Check for sales_detail_tb insert conditions
  IF NEW.event_sale = 'clearance-2024' AND NEW.cart_status = 2 THEN
    -- Insert a new record into sales_detail_tb
    INSERT INTO sales_detail_tb (id__customers, total_amount, product, quantity, uom, price, shop_date, created_at, created_by, updated_at, updated_by, remark)
    VALUES (NEW.id__customers, NEW.price_amount, NEW.product, NEW.quantity, NEW.uom, NEW.price, NEW.updated_at, NOW(), 'combined_sales_triggers', NOW(), 'combined_sales_triggers', 'clearance-2024');
  END IF;

END IF;

END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `carts_expo`
--

CREATE TABLE IF NOT EXISTS `carts_expo` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) NOT NULL,
  `product` varchar(255) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `price_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cart_status` tinyint(4) DEFAULT '0' COMMENT '0:inCart, 1:pendingPay, 2:paySuccess, 3:cancle',
  `chrg_id` varchar(255) DEFAULT NULL,
  `check_product` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `carts_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=158 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `clearancecarts`
--

CREATE TABLE IF NOT EXISTS `clearancecarts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `product` varchar(255) NOT NULL,
  `quantity` bigint(20) NOT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `price_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cart_status` tinyint(4) DEFAULT '0' COMMENT '0:inCart, 1:pendingPay, 2:paySuccess, 3:cancle',
  `chrg_id` varchar(255) DEFAULT NULL,
  `check_product` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `carts_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=78 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `clearance_customers`
--

CREATE TABLE IF NOT EXISTS `clearance_customers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `member_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address_company` text,
  `sale_event` varchar(255) NOT NULL DEFAULT 'clearance2021',
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_username_unique` (`username`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=362 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `clearance_customers_old`
--

CREATE TABLE IF NOT EXISTS `clearance_customers_old` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `member_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address_company` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_username_unique` (`username`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=34 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `clearance_customer_profile_entities`
--

CREATE TABLE IF NOT EXISTS `clearance_customer_profile_entities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customer` bigint(20) unsigned NOT NULL,
  `entityCompanyName` varchar(255) DEFAULT NULL,
  `entityCustomerName` varchar(255) DEFAULT NULL,
  `entityTel` varchar(255) DEFAULT NULL,
  `entityMail` varchar(255) DEFAULT NULL,
  `entityContactMore` varchar(255) DEFAULT NULL,
  `entityTaxId` varchar(255) DEFAULT NULL,
  `entityTaxAddr` varchar(255) DEFAULT NULL,
  `entityTaxDistric` varchar(255) DEFAULT NULL,
  `entityTaxProvince` varchar(255) DEFAULT NULL,
  `entityTaxCountry` varchar(255) DEFAULT NULL,
  `entityTaxPostcode` varchar(255) DEFAULT NULL,
  `entityShipAddr` varchar(255) DEFAULT NULL,
  `entityShipDistric` varchar(255) DEFAULT NULL,
  `entityShipProvince` varchar(255) DEFAULT NULL,
  `entityShipCountry` varchar(255) DEFAULT NULL,
  `entityShipPostCode` varchar(255) DEFAULT NULL,
  `start` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `entityCustomerId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `clearance_customer_profile_people`
--

CREATE TABLE IF NOT EXISTS `clearance_customer_profile_people` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customer` bigint(20) unsigned NOT NULL,
  `personCompanyName` varchar(255) DEFAULT NULL,
  `personIdCard` varchar(255) DEFAULT NULL,
  `personTel` varchar(255) DEFAULT NULL,
  `personMail` varchar(255) DEFAULT NULL,
  `personContactMore` varchar(255) DEFAULT NULL,
  `personShipAddr` varchar(255) DEFAULT NULL,
  `personShipDistric` varchar(255) DEFAULT NULL,
  `personShipProvince` varchar(255) DEFAULT NULL,
  `personShipCountry` varchar(255) DEFAULT NULL,
  `personShipPostCode` varchar(255) DEFAULT NULL,
  `start` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `personTaxAddr` varchar(255) DEFAULT NULL,
  `personTaxDistric` varchar(255) DEFAULT NULL,
  `personTaxProvince` varchar(255) DEFAULT NULL,
  `personTaxCountry` varchar(255) DEFAULT NULL,
  `personTaxPostcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `counts`
--

CREATE TABLE IF NOT EXISTS `counts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `section` varchar(100) NOT NULL,
  `count` int(10) unsigned NOT NULL DEFAULT '0',
  `note` longtext,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `member_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address_company` text,
  `sale_event` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_username_unique` (`username`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=797 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customersilink`
--

CREATE TABLE IF NOT EXISTS `customersilink` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `No_` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Name_2` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Address_2` varchar(255) DEFAULT NULL,
  `District` varchar(255) DEFAULT NULL,
  `Amphur` varchar(255) DEFAULT NULL,
  `County` varchar(255) DEFAULT NULL,
  `PostCode` varchar(10) DEFAULT NULL,
  `Contact` varchar(255) DEFAULT NULL,
  `PhoneNo_` varchar(255) DEFAULT NULL,
  `E-Mail` varchar(255) DEFAULT NULL,
  `VAT_Registration_No_` varchar(255) DEFAULT NULL,
  `Customer_Price_Group` varchar(255) DEFAULT NULL,
  `Salesperson_Code` varchar(255) DEFAULT NULL,
  `Salesperson_Name` varchar(255) DEFAULT NULL,
  `Blocked` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=30405 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customersilink_old02022565`
--

CREATE TABLE IF NOT EXISTS `customersilink_old02022565` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `No_` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Name_2` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Address_2` varchar(255) DEFAULT NULL,
  `District` varchar(255) DEFAULT NULL,
  `Amphur` varchar(255) DEFAULT NULL,
  `County` varchar(255) DEFAULT NULL,
  `Contact` varchar(255) DEFAULT NULL,
  `PhoneNo_` varchar(255) DEFAULT NULL,
  `E-Mail` varchar(255) DEFAULT NULL,
  `VAT_Registration_No_` varchar(255) DEFAULT NULL,
  `Customer_Price_Group` varchar(255) DEFAULT NULL,
  `Salesperson_Code` varchar(255) DEFAULT NULL,
  `Salesperson_Name` varchar(255) DEFAULT NULL,
  `Blocked` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=30370 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customer_profile_entities`
--

CREATE TABLE IF NOT EXISTS `customer_profile_entities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customer` bigint(20) unsigned NOT NULL,
  `entityCompanyName` varchar(255) DEFAULT NULL,
  `entityCustomerName` varchar(255) DEFAULT NULL,
  `entityTel` varchar(255) DEFAULT NULL,
  `entityMail` varchar(255) DEFAULT NULL,
  `entityContactMore` varchar(255) DEFAULT NULL,
  `entityTaxId` varchar(255) DEFAULT NULL,
  `entityTaxAddr` varchar(255) DEFAULT NULL,
  `entityTaxDistric` varchar(255) DEFAULT NULL,
  `entityTaxProvince` varchar(255) DEFAULT NULL,
  `entityTaxCountry` varchar(255) DEFAULT NULL,
  `entityTaxPostcode` varchar(255) DEFAULT NULL,
  `entityShipAddr` varchar(255) DEFAULT NULL,
  `entityShipDistric` varchar(255) DEFAULT NULL,
  `entityShipProvince` varchar(255) DEFAULT NULL,
  `entityShipCountry` varchar(255) DEFAULT NULL,
  `entityShipPostCode` varchar(255) DEFAULT NULL,
  `start` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=310 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customer_profile_people`
--

CREATE TABLE IF NOT EXISTS `customer_profile_people` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customer` bigint(20) unsigned NOT NULL,
  `personCompanyName` varchar(255) DEFAULT NULL,
  `personIdCard` varchar(255) DEFAULT NULL,
  `personTel` varchar(255) DEFAULT NULL,
  `personMail` varchar(255) DEFAULT NULL,
  `personContactMore` varchar(255) DEFAULT NULL,
  `personShipAddr` varchar(255) DEFAULT NULL,
  `personShipDistric` varchar(255) DEFAULT NULL,
  `personShipProvince` varchar(255) DEFAULT NULL,
  `personShipCountry` varchar(255) DEFAULT NULL,
  `personShipPostCode` varchar(255) DEFAULT NULL,
  `start` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `personTaxAddr` varchar(255) DEFAULT NULL,
  `personTaxDistric` varchar(255) DEFAULT NULL,
  `personTaxProvince` varchar(255) DEFAULT NULL,
  `personTaxCountry` varchar(255) DEFAULT NULL,
  `personTaxPostcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=311 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `customer_shipment_addresses_old`
--

CREATE TABLE IF NOT EXISTS `customer_shipment_addresses_old` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_tel` varchar(255) NOT NULL,
  `address_name` varchar(255) DEFAULT NULL,
  `address_no` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `village` varchar(255) DEFAULT NULL,
  `soi` varchar(255) DEFAULT NULL,
  `moo_no` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `amphur` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `post_code` varchar(255) NOT NULL,
  `address_detail` varchar(255) DEFAULT NULL,
  `tag_address` tinyint(4) DEFAULT '0',
  `starting_address` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_shipment_addresses_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `districts`
--

CREATE TABLE IF NOT EXISTS `districts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `province_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `districts_province_id_foreign` (`province_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=928 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `event_sales_old`
--

CREATE TABLE IF NOT EXISTS `event_sales_old` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_sale` varchar(255) NOT NULL,
  `event_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `identity_verifications`
--

CREATE TABLE IF NOT EXISTS `identity_verifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `pattern_join` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=774 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `interlinkid`
--

CREATE TABLE IF NOT EXISTS `interlinkid` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `member_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `address_company` text,
  `sale_event` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_username_unique` (`username`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=946 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `inv`
--

CREATE TABLE IF NOT EXISTS `inv` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inv` varchar(50) DEFAULT NULL,
  `chrg_id` varchar(255) NOT NULL,
  `data_checkout` text NOT NULL,
  `data_sales_header` longtext,
  `data_sales_line` longtext,
  `inv_status` tinyint(1) DEFAULT '0',
  `reserve` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `id__customers` bigint(20) unsigned NOT NULL,
  `event_sale` varchar(100) DEFAULT NULL,
  `ref_inv` varchar(20) NOT NULL,
  `resp_InsertSalesHeader` longtext,
  `resp_InsertSalesLine` longtext,
  `resp_ReleaseSalesInvoice` longtext,
  `resp_PostSalesInvoice` longtext,
  `complete` tinyint(1) NOT NULL DEFAULT '0',
  `lead_time` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=389 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `lead_times`
--

CREATE TABLE IF NOT EXISTS `lead_times` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(100) NOT NULL,
  `uom` varchar(20) DEFAULT NULL,
  `stock` varchar(100) DEFAULT NULL,
  `lead_time` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1696 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `lock_orders`
--

CREATE TABLE IF NOT EXISTS `lock_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `uom` varchar(10) DEFAULT NULL,
  `location` varchar(4) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `id_customer` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `timeout` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1080 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `migrations`
--

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `navisions`
--

CREATE TABLE IF NOT EXISTS `navisions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `host` varchar(255) NOT NULL,
  `token` longtext NOT NULL,
  `exp` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `new2_customersilink`
--

CREATE TABLE IF NOT EXISTS `new2_customersilink` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `No_` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Name_2` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Address_2` varchar(255) DEFAULT NULL,
  `District` varchar(255) DEFAULT NULL,
  `Amphur` varchar(255) DEFAULT NULL,
  `County` varchar(255) DEFAULT NULL,
  `PostCode` varchar(10) DEFAULT NULL,
  `Contact` varchar(255) DEFAULT NULL,
  `PhoneNo_` varchar(255) DEFAULT NULL,
  `E-Mail` varchar(255) DEFAULT NULL,
  `VAT_Registration_No_` varchar(255) DEFAULT NULL,
  `Customer_Price_Group` varchar(255) DEFAULT NULL,
  `Salesperson_Code` varchar(255) DEFAULT NULL,
  `Salesperson_Name` varchar(255) DEFAULT NULL,
  `Blocked` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `notify_kbanks`
--

CREATE TABLE IF NOT EXISTS `notify_kbanks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inv` varchar(255) DEFAULT NULL,
  `checksum` text,
  `request` longtext,
  `status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `chrg` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3959 ;

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
-- โครงสร้างตาราง `postal_codes`
--

CREATE TABLE IF NOT EXISTS `postal_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` int(11) NOT NULL,
  `sub_district_id` int(10) unsigned NOT NULL,
  `district_id` int(10) unsigned NOT NULL,
  `province_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postal_codes_sub_district_id_foreign` (`sub_district_id`),
  KEY `postal_codes_district_id_foreign` (`district_id`),
  KEY `postal_codes_province_id_foreign` (`province_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7445 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `product_conditions`
--

CREATE TABLE IF NOT EXISTS `product_conditions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pro_id` int(11) DEFAULT NULL,
  `pro_sku` varchar(50) DEFAULT NULL,
  `pro_brand` varchar(50) DEFAULT NULL,
  `pro_details` text,
  `minimum_length` varchar(255) DEFAULT NULL,
  `sales_type` varchar(50) DEFAULT NULL,
  `units_system` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=286 ;

--
-- ทริกเกอร์ `product_conditions`
--
DROP TRIGGER IF EXISTS `before_update_product_conditions`;
DELIMITER //
CREATE TRIGGER `before_update_product_conditions` BEFORE UPDATE ON `product_conditions`
 FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP
//
DELIMITER ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `provinces`
--

CREATE TABLE IF NOT EXISTS `provinces` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=78 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `public_holidays`
--

CREATE TABLE IF NOT EXISTS `public_holidays` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company` varchar(100) DEFAULT NULL,
  `date` varchar(50) NOT NULL COMMENT 'format: 01 June 2999',
  `note` varchar(255) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `ref_to_invs`
--

CREATE TABLE IF NOT EXISTS `ref_to_invs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ref_inv` varchar(20) NOT NULL,
  `inv` varchar(20) DEFAULT NULL,
  `chrg_id` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=479 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regis`
--

CREATE TABLE IF NOT EXISTS `regis` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `mobile_phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `metting_pattern` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=592 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `regis_event`
--

CREATE TABLE IF NOT EXISTS `regis_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `event` varchar(255) DEFAULT NULL,
  `id__interlinkid` bigint(20) NOT NULL,
  `meeting_pattern` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=570 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `remember_card_kbanks`
--

CREATE TABLE IF NOT EXISTS `remember_card_kbanks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `create_customer` text,
  `customer` longtext,
  `status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `remember_card_kbanks_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `report_soldouts`
--

CREATE TABLE IF NOT EXISTS `report_soldouts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `stock` varchar(50) DEFAULT NULL,
  `data_soldout` longtext,
  `sku_err` longtext,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=554 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `reserves`
--

CREATE TABLE IF NOT EXISTS `reserves` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_customer` bigint(20) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `price` double(10,2) NOT NULL DEFAULT '0.00',
  `quantity` int(11) NOT NULL DEFAULT '0',
  `uom` varchar(255) DEFAULT NULL,
  `total` double(10,2) NOT NULL DEFAULT '0.00',
  `data_make_reserve` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=8 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `reservitemsteppay`
--

CREATE TABLE IF NOT EXISTS `reservitemsteppay` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `product` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0',
  `todo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=11 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `sales_detail_tb`
--

CREATE TABLE IF NOT EXISTS `sales_detail_tb` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `quantity` bigint(20) unsigned DEFAULT '0',
  `uom` varchar(50) DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `shop_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0' COMMENT '0:normal',
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_report_by_cust_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=236 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `sales_report_tb`
--

CREATE TABLE IF NOT EXISTS `sales_report_tb` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id__customers` bigint(20) unsigned NOT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `customer_Name` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0' COMMENT '0:normal',
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_report_by_cust_id__customers_foreign` (`id__customers`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=45 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `spy`
--

CREATE TABLE IF NOT EXISTS `spy` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `No_` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Name_2` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Address_2` varchar(255) DEFAULT NULL,
  `District` varchar(255) DEFAULT NULL,
  `Amphur` varchar(255) DEFAULT NULL,
  `County` varchar(255) DEFAULT NULL,
  `Contact` varchar(255) DEFAULT NULL,
  `PhoneNo_` varchar(255) DEFAULT NULL,
  `E-Mail` varchar(255) DEFAULT NULL,
  `VAT_Registration_No_` varchar(255) DEFAULT NULL,
  `Customer_Price_Group` varchar(255) DEFAULT NULL,
  `Salesperson_Code` varchar(255) DEFAULT NULL,
  `Salesperson_Name` varchar(255) DEFAULT NULL,
  `Blocked` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- โครงสร้างตาราง `sub_districts`
--

CREATE TABLE IF NOT EXISTS `sub_districts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `district_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sub_districts_district_id_foreign` (`district_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7469 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_id__customers_foreign` FOREIGN KEY (`id__customers`) REFERENCES `customers` (`id`);

--
-- Constraints for table `customer_shipment_addresses_old`
--
ALTER TABLE `customer_shipment_addresses_old`
  ADD CONSTRAINT `customer_shipment_addresses_id__customers_foreign` FOREIGN KEY (`id__customers`) REFERENCES `customers` (`id`);

--
-- Constraints for table `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `districts_province_id_foreign` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `postal_codes`
--
ALTER TABLE `postal_codes`
  ADD CONSTRAINT `postal_codes_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `postal_codes_province_id_foreign` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `postal_codes_sub_district_id_foreign` FOREIGN KEY (`sub_district_id`) REFERENCES `sub_districts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `remember_card_kbanks`
--
ALTER TABLE `remember_card_kbanks`
  ADD CONSTRAINT `remember_card_kbanks_id__customers_foreign` FOREIGN KEY (`id__customers`) REFERENCES `customers` (`id`);

--
-- Constraints for table `sub_districts`
--
ALTER TABLE `sub_districts`
  ADD CONSTRAINT `sub_districts_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
