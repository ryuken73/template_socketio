# -*-coding: utf-8 -*-
import ConfigParser,os
import traceback
import logging
import sys

class ryuConfig() :

	def __init__(self, fname) :
		self.config = ConfigParser.RawConfigParser()
		self.config.read(fname)
		self.section = self.config.sections()
		self.essentialOption = []
		self.optionalOption  = []
		self.configInfo = []

	def getSection(self):
		return self.section

	def setEssentialOption(self, option):
		self.essentialOption.append(option)

	def setOptionalOption(self, option):
		self.optionalOption.append(option)


	def getOptions(self):

		for section in self.section :
			sectionInfo = {}
			sectionInfo['name'] = section

			if self.essentialOption == [] :
				logging.error('[+]you must set essential option using self.setEssentialOption(option_name)')

			if self.optionalOption == [] :
				logging.error('[+]you must set optional option using self.setOptionalOption(option_name)')

				# 鞘荐 可记 贸府
			for option in self.essentialOption :
				if not self.config.has_option(section, option) :
					logging.error('[+]you need set option in %s section : %s', section, option)
					sys.exit(1)
				else :
					try :
						sectionInfo[option] = self.config.get(section,option)
					except :
						logging.error('%s',traceback.format_exc())
						#logging.error('[+]cannot set necessary option : %s', err.option)
						sys.exit(1)

			for option in self.optionalOption :
				if not self. config.has_option(section, option) :
					sectionInfo[option] = None
				else :
					try :
						sectionInfo[option] = self.config.get(section,option)
					except :
						logging.error('%s',traceback.format_exc())
						#logging.error('[+]cannot set optional option : %s', err.option)
						sys.exit(1)


			self.configInfo.append(sectionInfo)

		return self.configInfo



if __name__ == "__main__" :

	logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s', level=logging.INFO)

	config = ryuConfig('ftpmNRS.cfg')
	config.setEssentialOption('host')
	config.setEssentialOption('user')
	config.setEssentialOption('pass')
	config.setEssentialOption('getFiles')
	config.setOptionalOption('toLocalDir')
	config.setOptionalOption('transferMode')

	print config.getOptions()

